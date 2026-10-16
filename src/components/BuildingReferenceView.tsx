import * as React from 'react';
import {
  Camera,
  Layers,
  MapPin,
  Box,
  Maximize2,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import {
  getBuildingVisualAssets,
  type BuildingReferencePhoto,
} from '../lib/three-assets';
import type { IncidentState, SourceDocument } from '../lib/incident-engine';

const BRADBURY_MATERIAL_SPECS = [
  {
    id: 'mat-roman-brick',
    name: 'Pressed Roman Red-Orange Brick Piers',
    location: 'Levels 2–4 Structural Facade Piers (S Broadway & W 3rd St)',
    swatchHex: '#b84a2c',
    accentHex: '#7c2d12',
    fireBehavior:
      'Non-combustible unreinforced/retrofitted masonry piers; high thermal mass retains heat around L3 West window openings.',
  },
  {
    id: 'mat-brownstone',
    name: 'Rusticated Arizona Brownstone Sandstone Arched Colonnade',
    location: 'Level 1 Ground Floor Romanesque Arches, Main Entrance & W 3rd St Base',
    swatchHex: '#9c6644',
    accentHex: '#78350f',
    fireBehavior:
      'Heavy rusticated stone blocks; houses dual brass Siamese FDC standpipe connection on W 3rd St elevation.',
  },
  {
    id: 'mat-terracotta',
    name: 'Carved Terra-Cotta Floral Spandrels & Bracketed Dentil Cornice',
    location: 'Inter-floor Spandrel Friezes & Deep Overhanging Roofline Cornice',
    swatchHex: '#d97742',
    accentHex: '#9a3412',
    fireBehavior:
      'Ornamental terra-cotta cladding over steel/masonry lintels; monitor for thermal spalling directly above L3 fire window.',
  },
  {
    id: 'mat-cast-iron-skylight',
    name: '3-Sided Cast-Iron Bay Windows, Fire Escapes & Peaked Glass Skylight',
    location: 'Projecting Polygonal Bays, Exterior Wrought-Iron Escapes & Atrium Roof',
    swatchHex: '#26292e',
    accentHex: '#38bdf8',
    fireBehavior:
      'Central 5-story skylit atrium acts as a vertical smoke chimney if corridor doors fail; roof glass skylight provides vertical ventilation.',
  },
];

const FERRY_MATERIAL_SPECS = [
  {
    id: 'mat-colusa-sandstone',
    name: 'Beaux-Arts Colusa Gray-Beige Sandstone Arched Arcade',
    location: 'Levels 1–2 Embarcadero Facade & Monumental Entry Portals',
    swatchHex: '#d6cfc2',
    accentHex: '#8c8273',
    fireBehavior:
      'Heavy seismic-retrofitted steel frame clad in Colusa sandstone blocks; contains lateral heat in L1 Market Hall.',
  },
  {
    id: 'mat-clock-tower',
    name: '245-ft Central Clock Tower & 4-Sided Illuminated Dials',
    location: 'Central Tower Shaft, Arched Belfry Lancets & Cupola Dome',
    swatchHex: '#e5e0d8',
    accentHex: '#b45309',
    fireBehavior:
      'Acts as a vertical draft landmark above the Grand Nave; keep tower mechanical chases isolated.',
  },
  {
    id: 'mat-gable-skylight',
    name: '660-ft Peaked Steel-Truss Clerestory Skylight Spine',
    location: 'Level 2 Grand Nave Gallery Vaulted Ceiling & Roof Ridge',
    swatchHex: '#38bdf8',
    accentHex: '#0284c7',
    fireBehavior:
      'Continuous 660-ft glass skylight spine channels grease-fire smoke horizontally along Level 2 mezzanine.',
  },
];

export function BuildingReferenceView({
  incident,
  onOpenSource,
  onJumpTo3DFloor,
}: {
  incident: IncidentState;
  onOpenSource: (source: SourceDocument, page?: number) => void;
  onJumpTo3DFloor: (floor: number | 'all') => void;
}) {
  const visualAssets = React.useMemo(
    () => getBuildingVisualAssets(incident.building?.name, incident.building?.address),
    [incident.building?.name, incident.building?.address]
  );

  const [selectedPhoto, setSelectedPhoto] = React.useState<BuildingReferencePhoto>(
    visualAssets.photos[0]
  );
  React.useEffect(() => {
    setSelectedPhoto(visualAssets.photos[0]);
  }, [visualAssets]);

  const [selectedPlanPage, setSelectedPlanPage] = React.useState<number>(
    visualAssets.isFerry ? 2 : 3
  );
  const [activeTab, setActiveTab] = React.useState<'photos' | 'floorplans' | 'materials'>('photos');

  const floorplanSource = React.useMemo(
    () =>
      incident.sources.find((s) => s.mimeType === 'application/pdf') || incident.sources[0],
    [incident.sources]
  );

  const activePlanObj = React.useMemo(() => {
    const pages = floorplanSource?.pages || [];
    return pages.find((p) => p.pageNumber === selectedPlanPage) || pages[0];
  }, [floorplanSource, selectedPlanPage]);

  const materialSpecs = visualAssets.isFerry ? FERRY_MATERIAL_SPECS : BRADBURY_MATERIAL_SPECS;

  return (
    <div
      data-testid="building-reference-view"
      className="flex h-full w-full flex-col lg:flex-row overflow-hidden bg-zinc-950"
    >
      {/* Left Column: High-Resolution Visual Stage (Active Photo / CAD Blueprint + Geocode Satellite Map) */}
      <div className="flex flex-col lg:w-[54%] h-[50%] lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-800 overflow-y-auto p-3.5 space-y-3.5 bg-zinc-950">
        {activeTab === 'floorplans' && activePlanObj ? (
          <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-semibold text-zinc-100">
                  {activePlanObj.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onJumpTo3DFloor(activePlanObj.pageNumber)}
                  className="inline-flex items-center gap-1 rounded-xs border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200 hover:bg-amber-500/25"
                >
                  <Box className="h-3 w-3" />
                  Inspect L{activePlanObj.pageNumber} in 3D
                </button>
                {floorplanSource && (
                  <button
                    type="button"
                    onClick={() => onOpenSource(floorplanSource, activePlanObj.pageNumber)}
                    className="inline-flex items-center gap-1 rounded-xs border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-200 hover:bg-zinc-700"
                  >
                    <Maximize2 className="h-3 w-3" />
                    Full Sheet
                  </button>
                )}
              </div>
            </div>
            <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-950">
              <img
                src={activePlanObj.svgDataUrl}
                alt={activePlanObj.label}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="p-3 border-t border-zinc-800/80">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {activePlanObj.extractedSummary}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-100">
                  {selectedPhoto.title}
                </span>
              </div>
              <span className="font-mono text-[10px] text-amber-300">
                {selectedPhoto.sourceLabel}
              </span>
            </div>
            <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-950">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                {selectedPhoto.materialTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xs border border-amber-500/40 bg-zinc-950/90 px-2 py-0.5 font-mono text-[10px] text-amber-200 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono">{selectedPhoto.angleLabel}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Applied to 3D Arched Facade
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{selectedPhoto.caption}</p>
            </div>
          </div>
        )}

        {/* High-Resolution Satellite Geocode & Tactical Approach Vector Map */}
        <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              Geocoded Aerial Footprint & Tactical Approach Vectors
            </span>
            <span className="font-mono text-[10px] text-sky-400">
              {visualAssets.geocodeLabel}
            </span>
          </div>
          <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-950">
            <img
              src={visualAssets.geocodeMapUrl}
              alt={`${visualAssets.geocodeLabel} Geocoded Satellite Map`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Reference Photos, CAD Floor Plans & Cladding Material Specs */}
      <div className="flex flex-col lg:w-[46%] h-[50%] lg:h-full overflow-hidden bg-zinc-950">
        {/* Right Panel Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3.5 py-2">
          <div className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              data-testid="ref-tab-photos"
              className={`inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-medium transition ${
                activeTab === 'photos'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              Street & Aerial Photos ({visualAssets.photos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('floorplans')}
              data-testid="ref-tab-floorplans"
              className={`inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-medium transition ${
                activeTab === 'floorplans'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-sky-400" />
              CAD Floor Plans
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              data-testid="ref-tab-materials"
              className={`inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-medium transition ${
                activeTab === 'materials'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
              Cladding & Fire Specs
            </button>
          </div>
        </div>

        {/* Scrollable Right Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {activeTab === 'photos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  AI-Referenced Street View & Aerial Captures ({incident.building?.name || 'Active Landmark'})
                </span>
                <span className="text-[11px] text-zinc-400">Select to inspect</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {visualAssets.photos.map((photo) => {
                  const isSelected = photo.id === selectedPhoto.id;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                      data-testid={`select-ref-photo-${photo.id}`}
                      className={`group overflow-hidden rounded-md border text-left transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <div className="aspect-16/10 w-full overflow-hidden bg-zinc-950">
                        <img
                          src={photo.dataUrl}
                          alt={photo.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="truncate text-xs font-semibold text-zinc-100">
                          {photo.title}
                        </div>
                        <div className="truncate font-mono text-[10px] text-amber-300">
                          {photo.materialTags.join(' · ')}
                        </div>
                        <p className="line-clamp-2 text-[11px] text-zinc-400">
                          {photo.caption}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'floorplans' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-100">
                    HABS / LADBS Architectural CAD Blueprints (Levels 1–4)
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Click any blueprint sheet to inspect on the main stage or jump to that floor in 3D
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(floorplanSource?.pages || []).map((page) => {
                  const isSelected = page.pageNumber === selectedPlanPage;
                  return (
                    <div
                      key={page.pageNumber}
                      onClick={() => setSelectedPlanPage(page.pageNumber)}
                      className={`cursor-pointer flex flex-col justify-between overflow-hidden rounded-md border transition ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-950 border-b border-zinc-800">
                          <img
                            src={page.svgDataUrl}
                            alt={page.label}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute top-2 left-2 rounded-xs bg-zinc-950/90 border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
                            Sheet A-10{page.pageNumber}
                          </span>
                        </div>
                        <div className="p-2.5 space-y-1">
                          <div className="text-xs font-semibold text-zinc-100">{page.label}</div>
                          <p className="line-clamp-2 text-[11px] text-zinc-400 leading-snug">
                            {page.extractedSummary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 border-t border-zinc-800/80 bg-zinc-950/60 px-2.5 py-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onJumpTo3DFloor(page.pageNumber);
                          }}
                          data-testid={`jump-3d-floor-${page.pageNumber}`}
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xs border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/25"
                        >
                          <Box className="h-3 w-3" />
                          Inspect L{page.pageNumber} in 3D
                        </button>
                        {floorplanSource && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSource(floorplanSource, page.pageNumber);
                            }}
                            className="inline-flex items-center justify-center gap-1 rounded-xs border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700"
                          >
                            <Maximize2 className="h-3 w-3" />
                            Full Sheet
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-3">
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Verified Exterior Envelope & Material Assembly ({incident.building?.address || 'Active Landmark'})
              </h3>
              {materialSpecs.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-900/60 p-3"
                >
                  <div
                    className="mt-0.5 h-8 w-8 shrink-0 rounded-xs border border-zinc-600"
                    style={{
                      background: `linear-gradient(135deg, ${mat.swatchHex} 0%, ${mat.accentHex} 100%)`,
                    }}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs font-semibold text-zinc-100">{mat.name}</div>
                    <div className="font-mono text-[10px] text-amber-300">{mat.location}</div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{mat.fireBehavior}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
