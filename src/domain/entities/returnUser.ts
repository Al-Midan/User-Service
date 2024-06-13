// db returning types write herer
export interface returnUser {
    _id?: string|any;
    username: string;
    email: string;
    password: string;
    isBlocked: boolean;
    isVerified?: boolean;
    verificationToken?: string;
    roles?:string[];
  }