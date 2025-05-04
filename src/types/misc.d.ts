export type MimeType = 'image/avif' | 'image/gif' | 'image/png' | 'image/webp'

export interface Image {
  readonly __typename?: 'Image';
  readonly url: string;
  readonly mime: MimeType;
  readonly size: number;
  readonly scale: number;
  readonly width: number;
  readonly height: number;
  readonly frameCount: number;
}

export interface Color {
  readonly _typename?: 'Color';
  readonly hex: string;
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

export type PaintGradientStop = {
  readonly __typename?: 'PaintGradientStop'
  readonly at: number
  readonly color: Color
}

export type PaintLayerTypeImage = {
  readonly __typename?: 'PaintLayerTypeImage'
  readonly images: Image[]
}

export type PaintRadialGradientShape = 'ELLIPSE' | 'CIRCLE'

export type PaintLayerTypeLinearGradient = {
  readonly __typename?: 'PaintLayerTypeLinearGradient'
  readonly angle: number
  readonly repeating: boolean
  readonly stops: PaintGradientStop[]
}

export type PaintLayerTypeRadialGradient = {
  readonly __typename?: 'PaintLayerTypeRadialGradient'
  readonly repeating: boolean
  readonly stops: PaintGradientStop[]
  readonly shape: PaintRadialGradientShape
}

export type PaintLayerTypeSingleColor = {
  readonly __typename?: 'PaintLayerTypeSingleColor'
  readonly color: Color
}

export type PaintShadow = {
  readonly __typename?: 'PaintShadow'
  readonly color: Color
  readonly offsetX: number
  readonly offsetY: number
  readonly blur: number
}

export type PaintLayerType =
  | PaintLayerTypeSingleColor
  | PaintLayerTypeLinearGradient
  | PaintLayerTypeRadialGradient
  | PaintLayerTypeImage

export type PaintLayer = {
  readonly __typename?: 'PaintLayer'
  readonly id: string
  readonly ty: PaintLayerType
  readonly opacity: number
}

export type PaintData = {
  readonly __typename?: 'PaintData'
  readonly layers: PaintLayer[]
  readonly shadows: PaintShadow[]
}

export type PaintRawData = {
  readonly __typename?: 'Paint'
  readonly id: string
  readonly name: string
  readonly description?: string | null
  readonly tags: string[]
  readonly data: PaintData
  readonly createdById: string
  readonly updatedAt: Date
  readonly searchUpdatedAt?: Date | null
}

export type ComputedLayerStyle = {
  opacity: number;
  image?: string;
  color?: string;
} | undefined;

export interface UserState {
  id: string;
  login: string;
  name: string;
  stv_id: string;
  is_channel: boolean;
}

export interface TokenUserData {
  token: string;
  user: string;
}

export interface ColorStop {
  color: number;
  at: number;
}

export interface Shadow {
  color: number;
  x_offset: number;
  y_offset: number;
  radius: number;
}

export type Callback<T> = (...client: T[]) => void;

export interface TwitchUser {
  chatColor: string | null;
  userPaint: PaintRawData | null;
  stv_pfp: string | null;
  twitch_pfp: string | null;
  name: string | null;
}

export interface Partner {
  username: string;
  display: string;
  stv_pfp: string;
  twitch_pfp: string;
  page_url: string;
  followers: number;
  joined_at: string;
  command_count: number;
  user_color: string;
}

export interface UpdateEvent {
  data: any;
  topic: string;
}
