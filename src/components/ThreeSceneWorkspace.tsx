import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Layers,
  Flame,
  Users,
  Wind,
  Truck,
  Compass,
  FileText,
  AlertTriangle,
  Eye,
  Clock,
  Info,
  CheckCircle2,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import {
  computeScenarioProgression,
  type IncidentState,
  type SceneRoom,
  type SourceDocument,
} from '../lib/incident-engine';
import {
  createBuildingExteriorShell,
  createUrbanContextEnvironment,
  createRealisticFireAndSmokeZone,
  createTrappedPerson3DAsset,
  createFireTruck3DAsset,
  createMedicalPost3DAsset,
} from '../lib/three-assets';
import { DialogRoot, DialogContent } from './ui/base-primitives';

export interface Selected3DElement {
  kind: 'room' | 'stair' | 'fire_zone' | 'staging';
  id: string;
  floor?: number;
}

interface ProjectedLabel {
  id: string;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  visible: boolean;
  variant: 'room' | 'fire' | 'smoke_only' | 'people' | 'staging' | 'stair';
  floor?: number;
  elementRef: Selected3DElement;
}

export function ThreeSceneWorkspace({
  incident,
  selectedFloor,
  onSelectFloor,
  selectedElement,
  onSelectElement,
  onOpenSource,
  isDispatcher,
  onSelectStagingCandidate,
  onPlaceCustomStaging,
  onStartDemoScenario,
}: {
  incident: IncidentState;
  selectedFloor: number | 'all';
  onSelectFloor: (floor: number | 'all') => void;
  selectedElement: Selected3DElement | null;
  onSelectElement: (el: Selected3DElement | null) => void;
  onOpenSource: (source: SourceDocument, page?: number) => void;
  isDispatcher: boolean;
  onSelectStagingCandidate?: (stagingId: string, status: 'selected' | 'candidate') => void;
  onPlaceCustomStaging?: (type: 'truck_staging' | 'medical_post', localPos: [number, number, number]) => void;
  onStartDemoScenario?: (scenarioId: 'bradbury_mockup' | 'ferry_live') => void;
}) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = React.useRef<OrbitControls | null>(null);
  const interactiveMeshesRef = React.useRef<Map<THREE.Object3D, Selected3DElement>>(new Map());
  const worldAnchorsRef = React.useRef<
    Array<{
      id: string;
      pos: THREE.Vector3;
      text: string;
      subtext?: string;
      variant: ProjectedLabel['variant'];
      floor?: number;
      elementRef: Selected3DElement;
    }>
  >([]);

  const [facadeMode, setFacadeMode] = React.useState<'cutaway' | 'wireframe'>(
    'cutaway'
  );
  const [showFireSmoke, setShowFireSmoke] = React.useState(true);
  const [showPeople, setShowPeople] = React.useState(true);
  const [showStaging, setShowStaging] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [scenarioMinutes, setScenarioMinutes] = React.useState(0);
  const [activeFabDialog, setActiveFabDialog] = React.useState<
    'people' | 'weather' | 'assumptions' | null
  >(null);
  const [placingStagingType, setPlacingStagingType] = React.useState<
    'truck_staging' | 'medical_post' | null
  >(null);
  const [labels, setLabels] = React.useState<ProjectedLabel[]>([]);

  const scenarioState = React.useMemo(() => {
    const stage = Math.round((scenarioMinutes / 60) * 100);
    const projectedZones = computeScenarioProgression(incident.scene, stage);
    const affectedRoomIds = Array.from(
      new Set(projectedZones.map((z) => z.roomId).filter((id): id is string => Boolean(id)))
    );
    const label =
      scenarioMinutes === 0
        ? 'Reported Situation (0m) — Directly observed & relayed fire/smoke zones only.'
        : `Illustrative 1-Hour Scenario (+${scenarioMinutes}m / 60m, Stage ${stage}%) — Unchecked interior & exterior facade spread.`;
    return {
      projectedZones,
      affectedRoomIds,
      label,
    };
  }, [incident.scene, scenarioMinutes]);

  const sourcesMap = React.useMemo(() => {
    const map = new Map<string, SourceDocument>();
    for (const s of incident.sources) {
      map.set(s.id, s);
    }
    return map;
  }, [incident.sources]);

  // Camera view presets
  const setCameraPreset = React.useCallback(
    (preset: 'isometric' | 'top' | 'north' | 'east' | 'fire') => {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      if (!cam || !ctrl) return;

      if (preset === 'isometric') {
        cam.position.set(-33, 21, 42);
        ctrl.target.set(0, 6.5, 2);
      } else if (preset === 'top') {
        cam.position.set(0, 52, 0.01);
        ctrl.target.set(0, 0, 0);
      } else if (preset === 'north') {
        cam.position.set(0, 14, -38);
        ctrl.target.set(0, 8, 0);
      } else if (preset === 'east') {
        cam.position.set(32, 20, 34);
        ctrl.target.set(0, 6.5, 1.5);
      } else if (preset === 'fire') {
        const fz = incident.scene.fireZones[0];
        if (fz) {
          cam.position.set(fz.position[0] - 13, fz.position[1] + 5, fz.position[2] + 15);
          ctrl.target.set(fz.position[0], fz.position[1], fz.position[2]);
        }
      }
      ctrl.update();
    },
    [incident.scene.fireZones]
  );

  // Initialize Three.js Scene, Camera, Renderer, and Controls
  React.useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b111e);
    scene.fog = new THREE.FogExp2(0x0b111e, 0.0055);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 260);
    camera.position.set(-33, 21, 42);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 8;
    controls.maxDistance = 110;
    controls.target.set(-1, 6.5, 2);
    controls.update();
    controlsRef.current = controls;

    // Warm architectural sunlight + cool urban sky fill
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.95);
    hemiLight.position.set(0, 60, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    dirLight.position.set(-34, 48, 36);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.45);
    fillLight.position.set(34, 24, -22);
    scene.add(fillLight);

    // ResizeObserver for responsive container
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    ro.observe(container);

    // Raycaster for clicking 3D elements or placing staging markers
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist > 6) return; // Ignore orbit drag

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // Check interactive meshes
      const meshes = Array.from(interactiveMeshesRef.current.keys());
      const intersects = raycaster.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !interactiveMeshesRef.current.has(obj)) {
          obj = obj.parent;
        }
        if (obj) {
          const matched = interactiveMeshesRef.current.get(obj);
          if (matched) {
            onSelectElement(matched);
            return;
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    let animId = 0;
    let frameCounter = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      controls.update();

      // Animate volumetric fire sprites, rising embers, flickering lights & smoke clouds
      scene.traverse((child) => {
        const ud = child.userData;
        if (!ud?.animateType) return;
        if (ud.animateType === 'fire_sprite') {
          const phase = ud.phase || 0;
          const speed = ud.speed || 5.0;
          const sx = ud.baseScaleX * (1 + Math.sin(elapsed * speed + phase) * 0.16);
          const sy = ud.baseScaleY * (1 + Math.cos(elapsed * (speed * 1.2) + phase) * 0.22);
          child.scale.set(sx, sy, 1);
          child.position.y = ud.baseY + Math.sin(elapsed * 4.2 + phase) * 0.18;
        } else if (ud.animateType === 'fire_ember') {
          const phase = ud.phase || 0;
          const rise = ((elapsed * 1.85 + phase) % ud.maxRise);
          child.position.y = ud.baseY + rise;
          child.position.x = ud.baseX + Math.sin(elapsed * 3.0 + phase) * 0.35;
          child.position.z = ud.baseZ + Math.cos(elapsed * 2.6 + phase) * 0.35;
        } else if (ud.animateType === 'fire_light' && child instanceof THREE.PointLight) {
          const phase = ud.phase || 0;
          child.intensity =
            ud.baseIntensity * (0.85 + Math.sin(elapsed * 9.5 + phase) * 0.18);
        } else if (ud.animateType === 'smoke_sprite') {
          const phase = ud.phase || 0;
          const drift = ((elapsed * 0.65 + phase) % 2.4);
          child.position.y = ud.baseY + drift * 0.55;
          child.position.x = ud.baseX + Math.sin(elapsed * 1.1 + phase) * 0.28;
          const s = ud.baseScale * (1 + drift * 0.14);
          child.scale.set(s, s * 0.9, 1);
        } else if (ud.animateType === 'person_wave') {
          const phase = ud.phase || 0;
          child.rotation.z = (ud.baseRotZ || 2.45) + Math.sin(elapsed * 5.2 + phase) * 0.36;
        }
      });

      renderer.render(scene, camera);

      // Update 2D projected overlay labels every 4 frames
      frameCounter++;
      if (frameCounter % 4 === 0 && mountRef.current) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        const nextLabels: ProjectedLabel[] = [];
        for (const anchor of worldAnchorsRef.current) {
          const projected = anchor.pos.clone().project(camera);
          const isBehind = projected.z > 1;
          const x = (projected.x * 0.5 + 0.5) * w;
          const y = (-(projected.y * 0.5) + 0.5) * h;
          const inBounds = !isBehind && x >= 10 && x <= w - 10 && y >= 10 && y <= h - 10;
          nextLabels.push({
            id: anchor.id,
            text: anchor.text,
            subtext: anchor.subtext,
            x,
            y,
            visible: inBounds,
            variant: anchor.variant,
            floor: anchor.floor,
            elementRef: anchor.elementRef,
          });
        }
        setLabels(nextLabels);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
    };
  }, []);

  // Rebuild dynamic 3D building geometry when scene, floor filter, or scenario slider changes
  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove previous dynamic content group
    const prevGroup = scene.getObjectByName('firesight_dynamic_root');
    if (prevGroup) {
      scene.remove(prevGroup);
    }

    interactiveMeshesRef.current.clear();
    worldAnchorsRef.current = [];

    const root = new THREE.Group();
    root.name = 'firesight_dynamic_root';

    const spec = incident.scene;
    const isStandby =
      incident.status === 'standby' || (spec.floors.length === 0 && !incident.building);

    if (isStandby) {
      const standbyGrid = new THREE.GridHelper(110, 44, 0x3f3f46, 0x18181b);
      standbyGrid.position.y = 0.02;
      root.add(standbyGrid);
      scene.add(root);
      (window as any).__FIRESIGHT_SCENE_DEBUG__ = {
        buildingRevision: spec.buildingRevision,
        envelopeId: spec.envelopeId,
        floorCount: 0,
        selectedFloor,
        scenarioMinutes,
        fireZonesCount: 0,
        flameZonesCount: 0,
        smokeOnlyZonesCount: 0,
        stagingCount: 0,
        quarantinedCount: 0,
        isStandby: true,
      };
      return;
    }

    const bWidth = spec.dimensions.width || 24;
    const bDepth = spec.dimensions.depth || 18;
    const bHeight = spec.dimensions.height || 16;

    // 1. Urban Context Environment (Adapts between Downtown LA & San Francisco Embarcadero Waterfront)
    const urbanEnv = createUrbanContextEnvironment(spec);
    root.add(urbanEnv);

    // 2. Realistic Architectural Building Exterior Shell
    if (selectedFloor === 'all') {
      const exteriorGroup = createBuildingExteriorShell(spec, facadeMode);
      root.add(exteriorGroup);
    }

    // 3. Floors & Interior Rooms
    for (const floor of spec.floors) {
      const isFloorSelected = selectedFloor === 'all' || selectedFloor === floor.level;
      if (!isFloorSelected) continue;

      const yBase = floor.elevationMeters;
      const fHeight = floor.heightMeters || 3.8;

      // Floor slab
      const slabGeo = new THREE.BoxGeometry(bWidth, 0.18, bDepth);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.85,
        transparent: selectedFloor !== 'all' ? false : true,
        opacity: selectedFloor !== 'all' ? 0.95 : 0.65,
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, yBase, 0);
      slabMesh.receiveShadow = true;
      root.add(slabMesh);

      // Rooms on this floor
      for (const room of floor.rooms) {
        const isSelected =
          selectedElement?.kind === 'room' && selectedElement.id === room.id;
        const isScenarioAffected = scenarioState.affectedRoomIds.includes(room.id);

        let roomColor = 0x3f3f46;
        if (room.type === 'server_room') roomColor = 0x7c2d12;
        else if (room.type === 'lab') roomColor = 0x1e3a8a;
        else if (room.type === 'corridor') roomColor = 0x27272a;
        else if (room.type === 'mechanical') roomColor = 0x713f12;
        else if (room.type === 'lobby') roomColor = 0x14532d;
        else if (room.type === 'uncertain_area' || room.uncertainty === 'uncertain_area') {
          roomColor = 0x52525b;
        }

        if (isSelected) {
          roomColor = 0xf59e0b;
        }

        const rW = Math.max(1, room.bounds.width - 0.15);
        const rD = Math.max(1, room.bounds.depth - 0.15);
        const rH = fHeight * 0.72;

        const roomGeo = new THREE.BoxGeometry(rW, rH, rD);
        const roomMat = new THREE.MeshStandardMaterial({
          color: roomColor,
          transparent: true,
          opacity: isSelected ? 0.55 : room.type === 'corridor' ? 0.22 : 0.36,
          roughness: 0.6,
        });
        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        roomMesh.position.set(room.bounds.x, yBase + rH / 2 + 0.1, room.bounds.z);
        root.add(roomMesh);

        const elRef: Selected3DElement = {
          kind: 'room',
          id: room.id,
          floor: floor.level,
        };
        interactiveMeshesRef.current.set(roomMesh, elRef);

        // Room outline wireframe
        const edgeColor = isSelected
          ? 0xfbbf24
          : isScenarioAffected && scenarioMinutes > 0
          ? 0xf97316
          : room.uncertainty === 'uncertain_area'
          ? 0xa1a1aa
          : 0x52525b;
        const roomEdges = new THREE.EdgesGeometry(roomGeo);
        const roomLine = new THREE.LineSegments(
          roomEdges,
          new THREE.LineBasicMaterial({ color: edgeColor })
        );
        roomLine.position.copy(roomMesh.position);
        root.add(roomLine);

        // Doors for room
        for (const door of room.doors) {
          const dW = door.orientation === 'ns' ? 1.2 : 0.25;
          const dD = door.orientation === 'ns' ? 0.25 : 1.2;
          const doorGeo = new THREE.BoxGeometry(dW, 2.1, dD);
          const doorMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.75,
          });
          const doorMesh = new THREE.Mesh(doorGeo, doorMat);
          doorMesh.position.set(door.x, yBase + 1.1, door.z);
          root.add(doorMesh);
        }

        // Add room label anchor
        worldAnchorsRef.current.push({
          id: `lbl-room-${room.id}`,
          pos: new THREE.Vector3(room.bounds.x, yBase + rH + 0.35, room.bounds.z),
          text: `L${floor.level} · ${room.name}`,
          subtext:
            room.uncertainty === 'uncertain_area'
              ? 'Unverified geometry'
              : room.hazards?.[0] || undefined,
          variant: 'room',
          floor: floor.level,
          elementRef: elRef,
        });
      }

      // Floor-only People Count Marker (when floor is known but exact room is unknown)
      if (showPeople) {
        const floorOnlyCount = incident.peopleSummary.floorOnlyCounts[floor.level] || 0;
        if (floorOnlyCount > 0) {
          const badgePos = new THREE.Vector3(-bWidth / 2 + 2.2, yBase + 2.4, bDepth / 2 - 1.5);
          const cylGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.3, 20);
          const cylMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const cylMesh = new THREE.Mesh(cylGeo, cylMat);
          cylMesh.position.copy(badgePos);
          root.add(cylMesh);

          worldAnchorsRef.current.push({
            id: `lbl-people-floor-${floor.level}`,
            pos: badgePos.clone().add(new THREE.Vector3(0, 0.8, 0)),
            text: `${floorOnlyCount} Person (Floor ${floor.level} Only)`,
            subtext: 'Relayed report — exact room unknown',
            variant: 'people',
            floor: floor.level,
            elementRef: {
              kind: 'room',
              id: floor.rooms[0]?.id || `floor-${floor.level}`,
              floor: floor.level,
            },
          });
        }
      }
    }

    // 4. Vertical Stairwell Shafts (stair-west-a, stair-east-b)
    for (const stair of spec.stairs) {
      const minY = (stair.fromFloor - 1) * 4;
      const maxY = stair.toFloor * 4;
      const sH = Math.max(4, maxY - minY);
      const stairGeo = new THREE.BoxGeometry(
        stair.position.width,
        sH,
        stair.position.depth
      );
      const isSelected =
        selectedElement?.kind === 'stair' && selectedElement.id === stair.id;
      const stairMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xfbbf24 : 0x10b981,
        transparent: true,
        opacity: 0.28,
      });
      const stairMesh = new THREE.Mesh(stairGeo, stairMat);
      stairMesh.position.set(stair.position.x, minY + sH / 2, stair.position.z);
      root.add(stairMesh);

      const elRef: Selected3DElement = { kind: 'stair', id: stair.id };
      interactiveMeshesRef.current.set(stairMesh, elRef);

      const stairEdges = new THREE.EdgesGeometry(stairGeo);
      const stairLine = new THREE.LineSegments(
        stairEdges,
        new THREE.LineBasicMaterial({ color: 0x10b981 })
      );
      stairLine.position.copy(stairMesh.position);
      root.add(stairLine);

      worldAnchorsRef.current.push({
        id: `lbl-stair-${stair.id}`,
        pos: new THREE.Vector3(stair.position.x, maxY + 0.6, stair.position.z),
        text: stair.name,
        subtext: `Vertical Access L${stair.fromFloor}–L${stair.toFloor}`,
        variant: 'stair',
        elementRef: elRef,
      });
    }

    // 5. Articulated 3D Human Rescue Models (요구조자) in Confirmed Rooms
    if (showPeople) {
      for (const [roomId, info] of Object.entries(incident.peopleSummary.preciseRoomCounts)) {
        if (selectedFloor !== 'all' && selectedFloor !== info.floor) continue;
        const floorObj = spec.floors.find((f) => f.level === info.floor);
        const roomObj = floorObj?.rooms.find((r) => r.id === roomId);
        if (!roomObj || !floorObj) continue;

        const isSelected =
          selectedElement?.kind === 'room' && selectedElement.id === roomId;

        const personPos = new THREE.Vector3(
          roomObj.bounds.x + 1.2,
          floorObj.elevationMeters + 0.14,
          roomObj.bounds.z + 1.2
        );

        const peopleGroup = createTrappedPerson3DAsset(info.count, isSelected);
        peopleGroup.position.copy(personPos);
        root.add(peopleGroup);

        const elRef: Selected3DElement = {
          kind: 'room',
          id: roomId,
          floor: info.floor,
        };
        interactiveMeshesRef.current.set(peopleGroup, elRef);
        peopleGroup.traverse((child) => {
          interactiveMeshesRef.current.set(child, elRef);
        });

        worldAnchorsRef.current.push({
          id: `lbl-people-room-${roomId}`,
          pos: personPos.clone().add(new THREE.Vector3(0, 2.75, 0)),
          text: `${info.count} Rescues Needed · ${roomObj.name}`,
          subtext: '3D Human Models · Waving at Window',
          variant: 'people',
          floor: info.floor,
          elementRef: elRef,
        });
      }
    }

    // 6. Volumetric Realistic Fire & Smoke Zones (Observed + Scenario Progression)
    if (showFireSmoke) {
      for (const fz of scenarioState.projectedZones) {
        if (selectedFloor !== 'all' && selectedFloor !== fz.floor) continue;
        const center = new THREE.Vector3(fz.position[0], fz.position[1], fz.position[2]);
        const elRef: Selected3DElement = {
          kind: 'fire_zone',
          id: fz.id,
          floor: fz.floor,
        };

        const { group: fzGroup, interactiveTarget } = createRealisticFireAndSmokeZone(
          fz,
          bWidth,
          bDepth
        );
        root.add(fzGroup);
        interactiveMeshesRef.current.set(interactiveTarget, elRef);
        fzGroup.traverse((child) => {
          interactiveMeshesRef.current.set(child, elRef);
        });

        worldAnchorsRef.current.push({
          id: `lbl-fz-${fz.id}`,
          pos: center.clone().add(new THREE.Vector3(0, 2.5, 0)),
          text: fz.hasFlames
            ? `ACTIVE FIRE · ${fz.areaLabel}`
            : `SMOKE ONLY (No Flames) · ${fz.areaLabel}`,
          subtext:
            scenarioMinutes > 0
              ? `Scenario +${scenarioMinutes}m (${fz.radiusMeters.toFixed(1)}m radius)`
              : `${fz.smokeColor.toUpperCase()} smoke (${fz.isAssumedSpread ? 'scenario' : 'observed'})`,
          variant: fz.hasFlames ? 'fire' : 'smoke_only',
          floor: fz.floor,
          elementRef: elRef,
        });
      }
    }

    // 7. Realistic 3D Fire Truck & EMS Medical Post (+ Cross) Assets on Exterior Ground
    if (showStaging) {
      for (const stg of spec.stagingCandidates) {
        const isSelected = stg.status === 'selected';
        const assetGroup =
          stg.type === 'truck_staging'
            ? createFireTruck3DAsset(isSelected)
            : createMedicalPost3DAsset(isSelected);

        assetGroup.position.set(stg.localPosition[0], 0, stg.localPosition[2]);
        // Orient vehicle along adjacent street (East Beale St vs South Market St)
        if (Math.abs(stg.localPosition[0]) > Math.abs(stg.localPosition[2])) {
          assetGroup.rotation.y = Math.PI / 2;
        }
        root.add(assetGroup);

        const elRef: Selected3DElement = { kind: 'staging', id: stg.id };
        interactiveMeshesRef.current.set(assetGroup, elRef);
        assetGroup.traverse((child) => {
          interactiveMeshesRef.current.set(child, elRef);
        });

        worldAnchorsRef.current.push({
          id: `lbl-stg-${stg.id}`,
          pos: new THREE.Vector3(stg.localPosition[0], 4.2, stg.localPosition[2]),
          text: `${stg.status === 'selected' ? '[DEPLOYED] ' : '[STAGING] '}${
            stg.type === 'medical_post' ? '+ ' : ''
          }${stg.label}`,
          subtext: stg.routeDurationSeconds
            ? `ETA ${Math.ceil(stg.routeDurationSeconds / 60)} min · ${
                stg.stationName || stg.placedBy
              }`
            : stg.placedBy,
          variant: 'staging',
          elementRef: elRef,
        });
      }
    }

    // 8. Meteorological Wind Vector Arrow (Shows Wind FROM -> Blowing TOWARD)
    if (typeof incident.weather.windDirectionFromDeg === 'number') {
      const fromRad = (incident.weather.windDirectionFromDeg * Math.PI) / 180;
      const toDir = new THREE.Vector3(-Math.sin(fromRad), 0, Math.cos(fromRad)).normalize();
      const arrowOrigin = new THREE.Vector3(-bWidth / 2 - 8, bHeight + 2, -bDepth / 2 - 4);
      const arrowHelper = new THREE.ArrowHelper(
        toDir,
        arrowOrigin,
        6,
        0x38bdf8,
        1.4,
        0.9
      );
      root.add(arrowHelper);
    }

    scene.add(root);

    // Expose deterministic scene debug hook for verification
    (window as any).__FIRESIGHT_SCENE_DEBUG__ = {
      buildingRevision: spec.buildingRevision,
      envelopeId: spec.envelopeId,
      floorCount: spec.floors.length,
      selectedFloor,
      scenarioMinutes,
      fireZonesCount: scenarioState.projectedZones.length,
      flameZonesCount: scenarioState.projectedZones.filter((z) => z.hasFlames).length,
      smokeOnlyZonesCount: scenarioState.projectedZones.filter((z) => !z.hasFlames).length,
      stagingCount: spec.stagingCandidates.length,
      quarantinedCount: spec.quarantinedItems.length,
    };
  }, [
    incident.scene,
    incident.status,
    incident.building,
    incident.peopleSummary,
    incident.weather,
    selectedFloor,
    selectedElement,
    facadeMode,
    showFireSmoke,
    showPeople,
    showStaging,
    scenarioMinutes,
    scenarioState,
  ]);

  // Resolve currently inspected object details
  const inspectedDetails = React.useMemo(() => {
    if (!selectedElement) return null;
    if (selectedElement.kind === 'room') {
      for (const fl of incident.scene.floors) {
        const rm = fl.rooms.find((r) => r.id === selectedElement.id);
        if (rm) {
          return {
            title: `Level ${fl.level} · ${rm.name}`,
            badge: rm.uncertainty === 'uncertain_area' ? 'Uncertain Geometry' : rm.type.replace('_', ' ').toUpperCase(),
            floor: fl.level,
            description: `Dimensions: ${rm.bounds.width}m × ${rm.bounds.depth}m · Floor use: ${fl.use}`,
            materials: rm.materials || [],
            hazards: rm.hazards || [],
            sourceRefs: rm.sourceIds,
            peopleCount: incident.peopleSummary.preciseRoomCounts[rm.id]?.count || 0,
          };
        }
      }
    }
    if (selectedElement.kind === 'stair') {
      const st = incident.scene.stairs.find((s) => s.id === selectedElement.id);
      if (st) {
        return {
          title: st.name,
          badge: `VERTICAL ACCESS L${st.fromFloor}–L${st.toFloor}`,
          description: `Connects Floors ${st.fromFloor} through ${st.toFloor}. Position (${st.position.x}m, ${st.position.z}m).`,
          materials: ['2-hour fire-rated concrete shaft'],
          hazards: [],
          sourceRefs: st.sourceIds,
          peopleCount: 0,
        };
      }
    }
    if (selectedElement.kind === 'fire_zone') {
      const fz = scenarioState.projectedZones.find((z) => z.id === selectedElement.id);
      const origFz = incident.scene.fireZones.find((z) => z.id === selectedElement.id);
      if (fz) {
        return {
          title: fz.areaLabel,
          badge: fz.hasFlames ? 'OBSERVED FLAMES + SMOKE' : 'SMOKE ONLY (NO FLAMES REPORTED)',
          floor: fz.floor,
          description: `Provenance: ${(origFz?.provenance || (fz.isAssumedSpread ? 'assumption' : 'observation')).toUpperCase()} · Smoke: ${fz.smokeColor.toUpperCase()} · Radius: ${fz.radiusMeters.toFixed(1)}m.${
            origFz?.movementNote ? ` ${origFz.movementNote}` : ''
          }`,
          materials: [],
          hazards: fz.hasFlames
            ? ['Active thermal & flame zone', 'Potential battery/electrical off-gassing']
            : ['Reduced visibility & smoke inhalation hazard — no active flame confirmed in this zone'],
          sourceRefs: origFz?.sourceId ? [{ sourceId: origFz.sourceId, page: 2 }] : [],
          peopleCount: 0,
        };
      }
    }
    if (selectedElement.kind === 'staging') {
      const stg = incident.scene.stagingCandidates.find((s) => s.id === selectedElement.id);
      if (stg) {
        return {
          title: stg.label,
          badge: stg.status === 'selected' ? 'SELECTED BY DISPATCH' : 'RESEARCH CANDIDATE',
          description: `Placed by: ${stg.placedBy} · Coordinates: ${stg.coordinates.lat.toFixed(4)}, ${stg.coordinates.lng.toFixed(4)}${
            stg.routeDurationSeconds
              ? ` · Approach ETA: ${Math.ceil(stg.routeDurationSeconds / 60)} min (${stg.routeDistanceMeters}m)`
              : ''
          }`,
          materials: [],
          hazards: stg.risks,
          outstandingChecks: stg.outstandingChecks,
          sourceRefs: [],
          stagingObj: stg,
        };
      }
    }
    return null;
  }, [selectedElement, incident.scene, incident.peopleSummary, scenarioState]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-zinc-950 select-none">
      {/* Top 3D Controls Bar */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/90 bg-zinc-950/90 px-3 py-2 backdrop-blur-xs">
        {/* Floor Selector */}
        <div className="flex items-center gap-1" role="group" aria-label="Floor isolation selector">
          <span className="mr-1 flex items-center gap-1 text-[11px] font-mono uppercase text-zinc-400">
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            Floor:
          </span>
          <button
            type="button"
            onClick={() => onSelectFloor('all')}
            data-testid="floor-btn-all"
            className={`rounded-sm px-2 py-1 text-xs font-medium transition ${
              selectedFloor === 'all'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            All ({incident.scene.floors.length})
          </button>
          {incident.scene.floors.map((fl) => (
            <button
              key={fl.level}
              type="button"
              onClick={() => onSelectFloor(fl.level)}
              data-testid={`floor-btn-${fl.level}`}
              className={`rounded-sm px-2 py-1 text-xs font-mono transition ${
                selectedFloor === fl.level
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              L{fl.level}
            </button>
          ))}
        </div>

        {/* Layer Toggles & Camera Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center rounded-sm border border-zinc-800 bg-zinc-900 p-0.5">
            {(
              [
                { id: 'cutaway', label: 'Architectural Cutaway' },
                { id: 'wireframe', label: 'Interior X-Ray' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setFacadeMode(m.id)}
                data-testid={`facade-mode-${m.id}`}
                className={`rounded-xs px-2 py-0.5 text-[11px] font-medium transition ${
                  facadeMode === m.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowFireSmoke((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium transition ${
              showFireSmoke
                ? 'border-orange-500/50 bg-orange-500/15 text-orange-300'
                : 'border-zinc-800 bg-zinc-950 text-zinc-500'
            }`}
          >
            <Flame className="h-3 w-3" />
            Fire/Smoke
          </button>
          <button
            type="button"
            onClick={() => setShowPeople((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium transition ${
              showPeople
                ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                : 'border-zinc-800 bg-zinc-950 text-zinc-500'
            }`}
          >
            <Users className="h-3 w-3" />
            People ({incident.peopleSummary.totalReported})
          </button>
          <button
            type="button"
            onClick={() => setShowLabels((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium transition ${
              showLabels
                ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                : 'border-zinc-800 bg-zinc-950 text-zinc-500'
            }`}
          >
            <Eye className="h-3 w-3" />
            Labels
          </button>

          <div className="h-3.5 w-px bg-zinc-800 mx-0.5" />

          <button
            type="button"
            onClick={() => setCameraPreset('isometric')}
            title="Reset isometric camera"
            className="inline-flex items-center gap-1 rounded-sm border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
          >
            <RotateCcw className="h-3 w-3" />
            Reset View
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('top')}
            className="rounded-sm border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
          >
            Plan View
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('fire')}
            className="rounded-sm border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-amber-300 hover:bg-zinc-800"
          >
            Focus Fire
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={mountRef}
          data-testid="three-canvas-container"
          className="h-full w-full cursor-grab active:cursor-grabbing"
        />

        {/* Empty Standby Overlay (Shown before Demo Scenario is triggered or while awaiting building research) */}
        {(incident.status === 'standby' ||
          (incident.scene.floors.length === 0 && !incident.building)) && (
          <div
            data-testid="three-standby-overlay"
            className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/75 p-6"
          >
            <div className="max-w-lg rounded-xl border border-zinc-800 bg-zinc-900/95 p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/15">
                <Flame className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="mt-3 text-base font-bold text-zinc-100">
                3D Spatial Reconstruction Standby
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                Awaiting 911 caller intake and Argon building research. Launch <span className="text-zinc-200 font-semibold">Demo 1</span> for a naturally paced (~2.8s/step) curated asset walkthrough, or <span className="text-sky-300 font-semibold">Demo 2</span> to execute real live <span className="text-sky-200 font-semibold">gemini-4-argon</span> Google Search, Multimodal Vision, and Maps API synthesis.
              </p>
              {onStartDemoScenario && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => onStartDemoScenario('bradbury_mockup')}
                    data-testid="canvas-start-demo-bradbury"
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-amber-500/50 bg-amber-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-sm transition hover:bg-amber-400"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    Demo 1: Bradbury Building (Asset Demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartDemoScenario('ferry_live')}
                    data-testid="canvas-start-demo-ferry"
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-sky-500/50 bg-sky-500/20 px-3.5 py-2 text-xs font-semibold text-sky-200 shadow-sm transition hover:bg-sky-500/30"
                  >
                    <Compass className="h-3.5 w-3.5 text-sky-400" />
                    Demo 2: SF Ferry Building (Live Research)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projected 2D Tactical Overlay Labels */}
        {showLabels && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {(() => {
              const w = mountRef.current?.clientWidth || 900;
              const priorityOrder: Record<ProjectedLabel['variant'], number> = {
                fire: 1,
                people: 2,
                smoke_only: 3,
                stair: 4,
                room: 5,
                staging: 6,
              };
              const candidates = labels
                .filter((lbl) => {
                  if (!lbl.visible) return false;
                  if (selectedFloor !== 'all' && lbl.floor && lbl.floor !== selectedFloor) {
                    return false;
                  }
                  if (
                    selectedFloor === 'all' &&
                    lbl.variant === 'room' &&
                    lbl.elementRef.id !== selectedElement?.id
                  ) {
                    return false;
                  }
                  if (selectedFloor === 'all' && lbl.variant === 'staging') {
                    return false;
                  }
                  if (selectedElement && lbl.x > w - 365 && lbl.y < 450) return false;
                  return true;
                })
                .sort((a, b) => priorityOrder[a.variant] - priorityOrder[b.variant]);

              const h = mountRef.current?.clientHeight || 600;
              const placed: ProjectedLabel[] = [];
              for (const cand of candidates) {
                const clampedX = Math.max(115, Math.min(w - 115, cand.x));
                let adjY = Math.max(34, Math.min(h - 28, cand.y));
                let collides = false;
                for (let attempt = 0; attempt < 3; attempt++) {
                  const hit = placed.some(
                    (p) => Math.abs(p.x - clampedX) < 210 && Math.abs(p.y - adjY) < 38
                  );
                  if (!hit) {
                    collides = false;
                    break;
                  }
                  collides = true;
                  adjY += 40;
                }
                if (!collides && adjY < h - 25) {
                  placed.push({ ...cand, x: clampedX, y: adjY });
                }
              }

              return placed.map((lbl) => (
                <button
                  key={lbl.id}
                  type="button"
                  onClick={() => onSelectElement(lbl.elementRef)}
                  style={{
                    transform: `translate3d(${Math.round(lbl.x)}px, ${Math.round(lbl.y)}px, 0) translate(-50%, -100%)`,
                  }}
                  className={`pointer-events-auto absolute left-0 top-0 max-w-[220px] truncate rounded-sm border px-1.5 py-0.5 text-left shadow-md backdrop-blur-xs transition hover:scale-105 ${
                    lbl.variant === 'fire'
                      ? 'border-red-500/80 bg-red-950/90 text-red-100'
                      : lbl.variant === 'smoke_only'
                      ? 'border-zinc-500/80 bg-zinc-900/90 text-zinc-200'
                      : lbl.variant === 'people'
                      ? 'border-cyan-500/80 bg-cyan-950/90 text-cyan-100'
                      : lbl.variant === 'staging'
                      ? 'border-amber-500/80 bg-amber-950/90 text-amber-100'
                      : lbl.variant === 'stair'
                      ? 'border-emerald-500/70 bg-emerald-950/85 text-emerald-100'
                      : 'border-zinc-700/80 bg-zinc-950/85 text-zinc-200'
                  }`}
                >
                  <div className="truncate text-[10px] font-semibold leading-tight">
                    {lbl.text}
                  </div>
                  {lbl.subtext && (
                    <div className="truncate text-[9px] font-mono opacity-80 leading-tight">
                      {lbl.subtext}
                    </div>
                  )}
                </button>
              ));
            })()}
          </div>
        )}

        {/* Compact Top-Left Staging Placement Pill (Dispatcher Only) */}
        {isDispatcher && onPlaceCustomStaging && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                onPlaceCustomStaging('truck_staging', [
                  14 + Math.round(Math.random() * 3),
                  0,
                  15,
                ])
              }
              className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950/90 px-2.5 py-1 text-[11px] font-medium text-zinc-200 shadow-md backdrop-blur-xs hover:border-amber-500/50 hover:bg-zinc-900"
            >
              <PlusCircle className="h-3 w-3 text-amber-400" />
              + Truck
            </button>
            <button
              type="button"
              onClick={() =>
                onPlaceCustomStaging('medical_post', [
                  -15,
                  0,
                  15 + Math.round(Math.random() * 2),
                ])
              }
              className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950/90 px-2.5 py-1 text-[11px] font-medium text-zinc-200 shadow-md backdrop-blur-xs hover:border-emerald-500/50 hover:bg-zinc-900"
            >
              <PlusCircle className="h-3 w-3 text-emerald-400" />
              + EMS Post
            </button>
          </div>
        )}

        {/* Right Side: Source-Linked Element Inspector */}
        {inspectedDetails && (
          <div
            data-testid="scene-element-inspector"
            className="pointer-events-auto absolute right-3 top-3 z-20 w-76 max-w-[calc(100%-1.5rem)] max-h-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border border-zinc-700/90 bg-zinc-950/95 p-3.5 text-xs shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2">
              <div>
                <span className="inline-block rounded-xs bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                  {inspectedDetails.badge}
                </span>
                <h4 className="mt-1 text-sm font-semibold text-zinc-100">
                  {inspectedDetails.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onSelectElement(null)}
                className="rounded-sm border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-400 hover:text-zinc-100"
              >
                Close
              </button>
            </div>

            <p className="mt-2 text-zinc-300 leading-relaxed">{inspectedDetails.description}</p>

            {inspectedDetails.hazards && inspectedDetails.hazards.length > 0 && (
              <div className="mt-2.5 rounded-sm border border-red-500/30 bg-red-950/30 p-2">
                <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-red-300">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Hazards & Risks</span>
                </div>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-red-200">
                  {inspectedDetails.hazards.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {inspectedDetails.materials && inspectedDetails.materials.length > 0 && (
              <div className="mt-2">
                <span className="font-mono text-[10px] uppercase text-zinc-400">
                  Structural / Compartment Materials:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {inspectedDetails.materials.map((m, i) => (
                    <span
                      key={i}
                      className="rounded-xs border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Staging Selection Toggle for Dispatcher */}
            {inspectedDetails.stagingObj && isDispatcher && onSelectStagingCandidate && (
              <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Dispatch Status:</span>
                <button
                  type="button"
                  onClick={() =>
                    onSelectStagingCandidate(
                      inspectedDetails.stagingObj!.id,
                      inspectedDetails.stagingObj!.status === 'selected' ? 'candidate' : 'selected'
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-sm border border-amber-500/50 bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-200 hover:bg-amber-500/25"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {inspectedDetails.stagingObj.status === 'selected'
                    ? 'Revert to Candidate'
                    : 'Mark as Selected Staging'}
                </button>
              </div>
            )}

            {/* Linked Source Citations */}
            {inspectedDetails.sourceRefs && inspectedDetails.sourceRefs.length > 0 && (
              <div className="mt-3 border-t border-zinc-800 pt-2.5 space-y-1.5">
                <div className="font-mono text-[10px] uppercase text-zinc-400">
                  Source-Linked Architectural Evidence
                </div>
                {inspectedDetails.sourceRefs.map((ref, idx) => {
                  const src = sourcesMap.get(ref.sourceId);
                  if (!src) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onOpenSource(src, ref.page || 1)}
                      className="flex w-full items-center justify-between gap-2 rounded-sm border border-zinc-700/80 bg-zinc-900 px-2.5 py-1.5 text-left text-[11px] text-zinc-100 hover:border-amber-500/60 hover:bg-zinc-800"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{src.title}</span>
                      </span>
                      {ref.page && (
                        <span className="shrink-0 rounded-xs bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                          Page {ref.page}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Streamlined Bottom Bar: Clean Time Slider on Left + Uniform FAB Dock on Right */}
      <div className="z-20 border-t border-zinc-800 bg-zinc-950/95 px-3.5 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Clean 1-Hour Time Slider (0m to +60m) */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px] max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-300 shrink-0">
              <Clock className="h-3 w-3 text-amber-400" />
              {scenarioMinutes === 0 ? 'NOW (0m)' : `+${scenarioMinutes}m`}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">0m</span>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={scenarioMinutes}
              onChange={(e) => setScenarioMinutes(Number(e.target.value))}
              aria-label="Illustrative 1-Hour Scenario Time Slider"
              data-testid="scenario-time-slider"
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-amber-500"
            />
            <span className="font-mono text-[11px] text-zinc-500">+60m (1h)</span>
          </div>

          {/* Right FAB Dock: Uniform Compact FAB Buttons for People, Weather/Wind & Assumptions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. People Accountability FAB */}
            <button
              type="button"
              onClick={() => setActiveFabDialog('people')}
              data-testid="people-accountability-hud"
              title="Inspect People Accountability & Rescue Locations"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-cyan-500/40 bg-zinc-900/95 px-3 text-xs font-medium text-cyan-200 shadow-md transition hover:border-cyan-400 hover:bg-zinc-800"
            >
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>People</span>
              <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.2 font-mono text-[11px] font-bold text-cyan-300">
                {incident.peopleSummary.totalReported}
              </span>
            </button>

            {/* 2. Weather & Wind Direction FAB */}
            <button
              type="button"
              onClick={() => setActiveFabDialog('weather')}
              data-testid="weather-hud-card"
              title="Inspect Weather & Smoke Plume Drift"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-sky-500/40 bg-zinc-900/95 px-3 text-xs font-medium text-sky-200 shadow-md transition hover:border-sky-400 hover:bg-zinc-800"
            >
              <Wind className="h-3.5 w-3.5 text-sky-400" />
              <span>{incident.weather.windCardinalFrom || 'WSW'}</span>
              <span className="font-mono text-[11px] text-zinc-300">
                {incident.weather.windSpeedKmh ?? 19}km/h · {incident.weather.temperatureCelsius ?? 22}°C
              </span>
            </button>

            {/* 3. Scenario Assumptions FAB */}
            <button
              type="button"
              onClick={() => setActiveFabDialog('assumptions')}
              data-testid="toggle-scenario-assumptions"
              title="Inspect Scenario Progression Assumptions"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/95 px-3 text-xs font-medium text-zinc-200 shadow-md transition hover:border-amber-500/50 hover:bg-zinc-800"
            >
              <Info className="h-3.5 w-3.5 text-amber-400" />
              <span>Assumptions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified FAB Detail Dialogs */}
      <DialogRoot
        open={activeFabDialog !== null}
        onOpenChange={(open) => {
          if (!open) setActiveFabDialog(null);
        }}
      >
        {activeFabDialog === 'people' && (
          <DialogContent
            title="People Accountability & Rescue Locations"
            description="Separates confirmed visual observations from floor-only reports and unassigned visitor logs."
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-md border border-cyan-500/30 bg-cyan-950/25 px-3.5 py-2.5">
                <span className="font-medium text-zinc-200">Total Unaccounted / Reported Inside</span>
                <span className="font-mono text-base font-bold text-cyan-300">
                  {incident.peopleSummary.totalReported} People
                </span>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Confirmed Room-Level Observations
                </div>
                {Object.entries(incident.peopleSummary.preciseRoomCounts).map(([rId, info]) => (
                  <div
                    key={rId}
                    className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2"
                  >
                    <div>
                      <div className="font-semibold text-zinc-100">{info.label}</div>
                      <div className="text-[11px] text-zinc-400">
                        Direct caller visual observation ·Placed in 3D room `{rId}`
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-sm bg-cyan-500/20 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">
                        {info.count} Observed
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectFloor(info.floor);
                          onSelectElement({ kind: 'room', id: rId, floor: info.floor });
                          setActiveFabDialog(null);
                        }}
                        className="rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-200 hover:bg-zinc-700"
                      >
                        Focus in 3D
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(incident.peopleSummary.floorOnlyCounts).length > 0 && (
                <div className="space-y-2">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    Floor-Only Reports (Exact Room Unconfirmed)
                  </div>
                  {Object.entries(incident.peopleSummary.floorOnlyCounts).map(([fl, count]) => (
                    <div
                      key={fl}
                      className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2"
                    >
                      <div>
                        <div className="font-semibold text-zinc-100">Floor {fl} (Room Unknown)</div>
                        <div className="text-[11px] text-zinc-400">
                          Relayed report — shown as Floor {fl} uncertainty badge
                        </div>
                      </div>
                      <span className="rounded-sm bg-amber-500/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-300">
                        {count} Reported
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {incident.peopleSummary.unknownLocationCount > 0 && (
                <div
                  data-testid="unknown-people-banner"
                  className="flex items-center justify-between rounded-md border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-amber-200"
                >
                  <div>
                    <div className="font-semibold">Unknown Floor / Unassigned Location</div>
                    <div className="text-[11px] text-amber-300/80">
                      Logged on building visitor roster — intentionally NOT placed on a 3D floor
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold">
                    {incident.peopleSummary.unknownLocationCount} Unassigned
                  </span>
                </div>
              )}
            </div>
          </DialogContent>
        )}

        {activeFabDialog === 'weather' && (
          <DialogContent
            title="Weather & Smoke Plume Drift"
            description={`Real-time meteorological conditions at ${incident.weather.placeName}`}
          >
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5">
                  <div className="font-mono text-[10px] uppercase text-zinc-400">Wind Origin</div>
                  <div className="mt-1 text-sm font-bold text-sky-300">
                    FROM {incident.weather.windCardinalFrom || 'WSW'} ({incident.weather.windDirectionFromDeg ?? 245}°)
                  </div>
                </div>
                <div className="rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5">
                  <div className="font-mono text-[10px] uppercase text-zinc-400">Speed / Gusts</div>
                  <div className="mt-1 font-mono text-sm font-bold text-zinc-100">
                    {incident.weather.windSpeedKmh ?? 19} / {incident.weather.windGustKmh ?? 31} km/h
                  </div>
                </div>
                <div className="rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5">
                  <div className="font-mono text-[10px] uppercase text-zinc-400">Temperature</div>
                  <div className="mt-1 font-mono text-sm font-bold text-zinc-100">
                    {incident.weather.temperatureCelsius ?? 22.4}°C
                  </div>
                </div>
                <div className="rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5">
                  <div className="font-mono text-[10px] uppercase text-zinc-400">Humidity</div>
                  <div className="mt-1 font-mono text-sm font-bold text-zinc-100">
                    {incident.weather.relativeHumidity ?? 48}% RH
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-sky-500/30 bg-sky-950/20 p-3 text-zinc-200">
                <div className="font-semibold text-sky-300">Tactical Plume Drift Implication</div>
                <p className="mt-1 leading-relaxed text-zinc-300">
                  Wind blowing FROM {incident.weather.windCardinalFrom || 'WSW'} pushes exterior smoke vented from the Level 3 West bay eastward across the central skylit atrium and toward the East stairwell / Spring St block. Keep EMS Triage Post upwind on the W 3rd & Broadway SW apron.
                </p>
              </div>
            </div>
          </DialogContent>
        )}

        {activeFabDialog === 'assumptions' && (
          <DialogContent
            title="Illustrative Scenario Progression & Assumptions"
            description={scenarioState.label}
          >
            <div
              data-testid="scenario-assumptions-panel"
              className="space-y-3 text-xs text-zinc-300"
            >
              <div className="rounded-md border border-zinc-800 bg-zinc-900/80 p-3">
                <div className="font-mono text-[10px] uppercase text-amber-400">
                  1. Fuel & Compartment Assumptions
                </div>
                <p className="mt-1 leading-relaxed">
                  {incident.scene.scenarioAssumptions.fuelAssumptions}
                </p>
                <p className="mt-1 text-zinc-400">
                  {incident.scene.scenarioAssumptions.compartmentAssumptions}
                </p>
              </div>

              <div className="rounded-md border border-zinc-800 bg-zinc-900/80 p-3">
                <div className="font-mono text-[10px] uppercase text-sky-400">
                  2. Openings, Central Atrium & Wind Plume
                </div>
                <p className="mt-1 leading-relaxed">
                  {incident.scene.scenarioAssumptions.openingsAssumptions}
                </p>
                <p className="mt-1 text-zinc-400">
                  {incident.scene.scenarioAssumptions.ventilationAssumptions}
                </p>
              </div>

              <div className="rounded-md border border-zinc-800 bg-zinc-900/80 p-3">
                <div className="font-mono text-[10px] uppercase text-emerald-400">
                  3. Suppression & Provenance Boundaries
                </div>
                <p className="mt-1 leading-relaxed">
                  {incident.scene.scenarioAssumptions.suppressionAssumptions}
                </p>
                <p className="mt-1.5 font-medium text-amber-300">
                  Affected Compartments at +{scenarioMinutes}m ({scenarioState.affectedRoomIds.length}):{' '}
                  {scenarioState.affectedRoomIds.join(', ')}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </DialogRoot>
    </div>
  );
}
