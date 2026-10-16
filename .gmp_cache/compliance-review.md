---
name: compliance-review
description: Use this skill to review implementation plans or code that uses Google Maps Platform in order to identify revisions that need to be made based on Google Maps Platform Terms of Service, Acceptable Use Policy, EEA terms, AI terms, and deprecation policies. Use this skill each time there is a significant revision to an implementation plan or code such as a change in the Google Maps Platform products selected or the handling of responses from Google Maps Platform.
license: Apache-2.0
metadata:
  version: 1.1.0
---

# Google Maps Platform: Terms of Service Check Methodology

This skill provides a step-by-step, methodical procedure for verifying that a
customer application's architectural design and code conform to all applicable
Google Maps Platform and Google Cloud Platform (GCP) terms, policies, and
regional restrictions.

## Methodical Compliance Review Procedure

Follow these four steps sequentially to evaluate any Google Maps Platform
proposal, code suggestion, or architectural design.

### Step 1: Regional & Territory Restriction Check

Verify whether the application's intended target audience, deployment, or
billing profile conflicts with regional restrictions.

1.  **Prohibited Territories Check:** Confirm the Customer Application is not
    distributed, marketed, or functional within any of the prohibited
    territories.
    *   **Prohibited Territories:** China, Crimea, Cuba, Donetsk People's
        Republic, Iran, Luhansk People's Republic, North Korea, Syria, and
        Vietnam.
    *   *Reference:*
        [Google Maps Platform Prohibited Territories](https://cloud.google.com/maps-platform/terms/maps-prohibited-territories?utm_campaign=gmp_git_agentskills_v1)
2.  **Regional Terms Check:** If the customer billing address is in one of the
    regions listed in the Regional Terms section of the Google Maps Platform
    Terms of Service, those terms supersede the main Google Maps Platform Terms
    of Service.
    *   *Reference:*
        [Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms?utm_campaign=gmp_git_agentskills_v1)
3.  **European Economic Area (EEA) Check:** Determine if the billing account
    address of the customer is within the EEA (EU Member States + Iceland,
    Liechtenstein, and Norway). If yes, apply EEA-specific rules:
    *   **Relaxed Rules:** Under the FCO4 commitment (active until July 8,
        2035), EEA customers are not subject to standard restrictions
        prohibiting:
        1.  Re-creating Google products/features
        2.  Combining Google Maps Platform content with non-Google maps (subject
            to specific exceptions)
        3.  Using Google Maps Platform in embedded vehicle systems
    *   **Strict Places API Rules:** Non-geospatial Places data (excluding
        lat/lng and place_id) is restricted to the specific permitted use cases
        (such as address autocompletion, store finders, social tagging).
    *   **No Decision-Making:** Results from the Places Aggregate API must not
        be used to make decisions impacting individuals' rights (e.g., credit,
        housing, employment, or insurance scores).
    *   *Reference:*
        [Google Maps Platform EEA Terms of Service](https://cloud.google.com/terms/maps-platform/eea?utm_campaign=gmp_git_agentskills_v1)
    *   *Reference:*
        [Google Maps Platform EEA Service Specific Terms](https://cloud.google.com/terms/maps-platform/eea/maps-service-terms?utm_campaign=gmp_git_agentskills_v1)
    *   *Reference:*
        [Places API EEA Permitted Uses](https://cloud.google.com/terms/maps-platform/eea-places-api-permitted-uses?utm_campaign=gmp_git_agentskills_v1)

### Step 2: Generative AI & Model Training Check

Assess whether the project introduces artificial intelligence, machine learning,
or generative model integrations.

1.  **No Derived Content / Training Prohibition:** Ensure that Google Maps
    Content (including business names, reviews, coordinates, or elevation
    models) is **never** used to train, fine-tune, or improve machine learning
    or AI models.
2.  **AI Integration Terms:** If the application uses Generative AI (e.g.,
    Gemini API) alongside Google Maps Platform data, verify compliance with both
    AI-specific terms and standard cloud guidelines.
    *   *Reference:*
        [Google Generative AI Additional Terms of Service](https://policies.google.com/terms/generative-ai?utm_campaign=gmp_git_agentskills_v1)
    *   *Reference:*
        [Google Cloud Service Specific Terms (Generative AI Section)](https://cloud.google.com/terms/service-terms?utm_campaign=gmp_git_agentskills_v1)

For projects involving artificial intelligence and generative content, consider
Grounding products and Agentic UI toolkit listed at
http://developers.google.com/maps/ai.

### Step 3: Layered Document Checklist (The 5 Pillars)

Methodically cross-reference the application's features against the five core
governing documents of the Google Maps Platform ecosystem.

1.  **Google Maps Platform Terms of Service (Main ToS):** Check billing
    requirements, basic license grants, and general usage rights.
    *   *Reference:*
        [Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms?utm_campaign=gmp_git_agentskills_v1)
2.  **Maps Service Specific Terms:** Verify product-specific restrictions:
    *   **Caching Limits:** Check if caching is permitted. Geospatial data
        (lat/lng) is typically limited to **30 consecutive calendar days**.
        Check the specific table for environmental APIs (Air Quality, Solar,
        Pollen, Weather).
    *   **No Scraping:** Ensure bulk downloads or indexing of Google Maps
        Content is not proposed.
    *   *Reference:*
        [Maps Service Specific Terms](https://cloud.google.com/maps-platform/terms/maps-service-terms?utm_campaign=gmp_git_agentskills_v1)
3.  **Google Cloud Platform Terms of Service (Cloud ToS):** Check general GCP
    rules, resource quotas, and API credential management.
    *   *Reference:*
        [Google Cloud Platform Terms of Service](https://cloud.google.com/terms?utm_campaign=gmp_git_agentskills_v1)
4.  **Google Privacy Policy & End User Terms:** Confirm that the application's
    terms explicitly state that it integrates Google Maps features and is
    subject to the End User Terms. Verify that location tracking requires
    explicit, revocable end-user consent.
    *   *Reference:*
        [Google Maps End User Additional Terms of Service](https://maps.google.com/help/terms_maps/?utm_campaign=gmp_git_agentskills_v1)
    *   *Reference:*
        [Google Privacy Policy](https://policies.google.com/privacy?utm_campaign=gmp_git_agentskills_v1)
    *   *Reference:*
        [Google Controller-Controller Data Protection Terms](https://business.safety.google/controllerterms/?utm_campaign=gmp_git_agentskills_v1)
5.  **Google Acceptable Use Policy (AUP):** Ensure that the service is not used
    for prohibited use cases:
    *   **High Risk Activities:** Banned from emergency services, autonomous
        vehicle routing, aviation, and nuclear facility control.
    *   **COPPA:** Banned from child-directed applications.
    *   **Sensitive Data:** Banned from handling ITAR-regulated or
        HIPAA-regulated medical records.
    *   *Reference:*
        [Google Maps Platform Acceptable Use Policy](https://cloud.google.com/maps-platform/terms/aup?utm_campaign=gmp_git_agentskills_v1)

### Step 4: Lifecycle, SLA, and Deprecation Review

Identify the support commitments and deprecation risks for all APIs proposed in
the architecture.

1.  **Launch Stages Verification:** Identify if the APIs proposed are General
    Availability (GA) or Pre-GA (Preview, Alpha, Beta).
    *   **Pre-GA Rules:** Pre-GA offerings are provided "as-is", do not qualify
        for Service Level Agreements (SLAs), and do not carry technical support
        commitments.
    *   *Reference:*
        [Google Cloud Launch Stages](https://cloud.google.com/terms/launch-stages?utm_campaign=gmp_git_agentskills_v1)
2.  **Service Level Agreement (SLA):** For GA Core Services, verify the Uptime
    SLO (generally 99.9%).
    *   *Reference:*
        [Google Maps Platform SLA](https://cloud.google.com/maps-platform/terms/sla?utm_campaign=gmp_git_agentskills_v1)
    *   *Reference:*
        [Google Maps Platform Core Services Summary](https://cloud.google.com/maps-platform/terms/maps-services?utm_campaign=gmp_git_agentskills_v1)
3.  **Deprecation Policy:** GA Core Services are subject to deprecation
    protection, requiring a deprecation notice (typically 12 months) before
    decommissioning.
    *   *Reference:*
        [Google Cloud Service Specific Terms (Deprecation Policy)](https://cloud.google.com/terms/service-terms?utm_campaign=gmp_git_agentskills_v1)
4.  **Open Source Client Library Exception:** Proactively alert developers that
    the standard enterprise deprecation policies **do not apply** to
    Google-maintained open-source client libraries. These libraries are updated
    under semantic versioning and the OSS Library Breaking Change Policy,
    meaning breaking changes are signaled via major version bumps (e.g., v1 to
    v2) rather than a formal deprecation schedule.
    *   *Reference:*
        [Google Open Source Library Breaking Change Policy](https://opensource.google/documentation/reference/releasing/versioning?utm_campaign=gmp_git_agentskills_v1)

## Technical Support Guidelines

*   Refer to the
    [Technical Support Services Guidelines (TSSG)](https://cloud.google.com/maps-platform/terms/tssg?utm_campaign=gmp_git_agentskills_v1)
    to check eligibility for ticket logging, response times, and escalations.
