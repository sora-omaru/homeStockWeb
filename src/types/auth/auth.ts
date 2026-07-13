export type LoginRequest = {
  email: string;
  password: string;
};

export type UserAuthResponse = {
  publicId: string;
  displayName: string;
  message: string;
};

export type MeResponse = {
  publicId: string;
  displayName: string;
};
