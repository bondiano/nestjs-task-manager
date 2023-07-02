# Identity Access Module

This module helps to implement basic authentication strategy with sign up, sign out with JWT and common guard.

Also there is some helper methods and decorators to help to work with authenticated user.

```s
     ********                   ▐ server
     *      * access token      ▐
     *      *◄───────────────── ▐      short life - access token
     * user * ─────────────────►▐ (need to use `refreshToken` method to take a new one)
     *      *                   ▐
     *      * ─────────────────►▐
     *      *◄───────────────── ▐
     ******** refresh token     ▐      refresh token rotation
                                ▐ (returns access/refresh tokens pair)
```

## Usage

1. Import to your module

```typescript
IamModule.forRoot({ entity: Admin, key: 'admin' }),
```

2. Inject `IamService` to your service and implement `IAuthenticationService`
3. Use `@Auth(AuthType)` decorator for controller


### Services list

* `signUp` - create new user
* `signIn` - sign in user
* `signOut` - sign out user
* `refreshToken` - create a new pair of access/refresh tokens, invalidate old refresh token
