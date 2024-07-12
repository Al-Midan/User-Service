// db returning types write herer
export interface returnUser {
    _id?: string|any;
    username: string;
    email: string;
    isBlocked: boolean;
    isVerified?: boolean;
    verificationToken?: string;
    roles?:string;
    profilePic?: string | null;
  }