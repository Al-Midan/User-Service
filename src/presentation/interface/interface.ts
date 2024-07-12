export interface googelUserData {
    username: string;
    email: string;
    password: string;
  }

 export interface GoogleUser {
    name: {
      givenName: string;
    };
    emails: Array<{
      value: string;
      verified: boolean;
    }>;
    id: string;
  }
  