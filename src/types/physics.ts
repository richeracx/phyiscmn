export type PhysicsDomainId =
  | 'mechanics'
  | 'electromagnetism'
  | 'optics'
  | 'waves'
  | 'thermodynamics'
  | 'gravity'
  | 'orbital'
  | 'projectile';

export interface PhysicsDomain {
  id: PhysicsDomainId;
  titleKey: string;
  equation: string;
  descKey: string;
  mediaType: 'image' | 'video' | 'svg';
  mediaSrc?: string;
  scaleCrop?: boolean;
}
