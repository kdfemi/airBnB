import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { take, tap, map } from 'rxjs/operators';
import { BehaviorSubject, from } from 'rxjs';
import { User } from './user.model';
import { Plugins } from '@capacitor/core';

interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {


    // tslint:disable-next-line: variable-name
    private _user = new BehaviorSubject<User>(null);
    // tslint:disable-next-line: variable-name
    private _token = new BehaviorSubject<string>(null);

    get userIsAuthenicated() {
      return this._user.asObservable().pipe(
        map(user => {
          if (user) {
            return !!user.token;
          } else {
            return false;
          }
        }));
    }

    get userId() {
      return this._user.asObservable().pipe(
        map(user => {
          if (user) {
            return user.id;
          } else {
            return null;
          }
      }));
    }

    get token() {
      return this._user.asObservable().pipe(
        map(user => {
          if (user) {
            return user.token;
          } else {
            return null;
          }
      }));
    }

  constructor(private http: HttpClient) { }

  autoLogin() {
   return from(Plugins.Storage.get({key: 'authData'})).pipe(
     map(storedData => {
       if (!storedData || !storedData.value) {
         return null;
       }
       const parsedData = JSON.parse(storedData.value) as {userId: string, token: string, tokenExpirationDate: string, email: string};
       const expirationTime = new Date(parsedData.tokenExpirationDate);
       if (expirationTime <= new Date()) {
         return null;
       }
       const user = new User(parsedData.userId, parsedData.email, parsedData.token, expirationTime);
       return user;
     }), tap( user => {
       if (user) {
         this._user.next(user);
       }
     }), map(user => {
       return !!user;
     })
   );
  }

  signup( email: string, password: string) {

   return this.http
   .post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
    {email, password, returnSecureToken: true}).pipe(
      tap(this.setUserData.bind(this))
    );
  }
  login(email: string, password: string) {
    return this.http
    .post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
     {email, password, returnSecureToken: true}).pipe(
      tap( userData => {
        this.setUserData(userData);
      })
      // tap(this.setUserData.bind(this))
    );
  }

  logout() {
    this._user.next(null);
    Plugins.Storage.remove({key: 'authData'});
  }

  private setUserData(userData: AuthResponseData) {
      const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
      this._user.next(new User(userData.localId, userData.email, userData.idToken, expirationTime));
      this.storeAuthData(userData.localId, userData.email, userData.idToken, expirationTime.toISOString());
  }

  private storeAuthData( userId: string, email: string, token: string, tokenExpirationDate: string) {
    const data = JSON.stringify({userId, token, tokenExpirationDate, email});
    Plugins.Storage.set({key: 'authData' , value: data});
  }

}
