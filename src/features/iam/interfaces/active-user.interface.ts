export interface IActiveUserData {
  /**
   * The "subject" of the token.
   * The value of this property is the user's ID that generated the token.
   */
  sub: number;

  /**
   * The subject's (user) email address
   */
  email: string;

  /**
   * The subject's (user) role
   */
  role: string;
}
