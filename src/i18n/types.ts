export type Language = 'en' | 'tr';

export interface ParameterItem {
  name: string;
  symbol: string;
  value: string;
  unit: string;
}

export interface GoverningLawItem {
  name: string;
  equation: string;
}

export interface DerivationStepItem {
  stepNumber: string;
  tag: string;
  description: string;
  equation: string;
}

export interface DomainCardItem {
  id: string;
  title: string;
  description: string;
  equation: string;
  variablesSummary: string;
  mediaType: 'image' | 'video' | 'svg';
  mediaSrc?: string;
  mediaClass?: string;
}

export interface MethodologyStepItem {
  stepNumber: string;
  title: string;
  description: string;
  subtext: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface TranslationDictionary {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    brandName: string;
    domainsLink: string;
    methodologyLink: string;
    openSolverCta: string;
    langAriaLabel: string;
  };
  hero: {
    badge: string;
    displayH1: string;
    subtitle: string;
    quickSolve: {
      placeholder: string;
      uploadPhoto: string;
      drawDiagram: string;
      solve: string;
      quickPillsLabel: string;
      quickPills: string[];
    };
  };
  showcase: {
    sectionBadge: string;
    title: string;
    subtitle: string;
    imageCard: {
      alt: string;
      overlayBadgeLines: [string, string, string];
    };
    solutionCard: {
      systemId: string;
      problemTitle: string;
      statusBadge: string;
      givensHeading: string;
      parameters: ParameterItem[];
      governingLawsHeading: string;
      laws: GoverningLawItem[];
      diagramHeading: string;
      diagramLabels: {
        normalForce: string;
        gravity: string;
        friction: string;
        netForce: string;
        inclineAngle: string;
        surfaceAxis: string;
      };
      derivationHeading: string;
      steps: DerivationStepItem[];
      finalResult: {
        label: string;
        value: string;
        badge: string;
      };
    };
  };
  domains: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    cards: DomainCardItem[];
  };
  methodology: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    steps: MethodologyStepItem[];
  };
  footer: {
    copyright: string;
    statusBadge: string;
    links: FooterLinkItem[];
  };
}
