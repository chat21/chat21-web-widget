import { LoggerService } from '../../providers/abstract/logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserModel } from '../../models/user';
import { avatarPlaceholder, getColorBck } from '../../utils/utils-user';
import { AppStorageService } from '../abstract/app-storage.service';
import { LoggerInstance } from '../logger/loggerInstance';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class TiledeskAuthService {

  // private persistence: string;
  public SERVER_BASE_URL: string;

  // private
  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_SIGNIN_ANONYMOUSLY: string;
  private URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN: string;

  private tiledeskToken: string;
  private currentUser: UserModel;
  private logger: LoggerService = LoggerInstance.getInstance()
  
  constructor(public http: HttpClient,
              public appStorage: AppStorageService) { }


  initialize(serverBaseUrl: string) {
    this.SERVER_BASE_URL = serverBaseUrl;
    this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    this.URL_TILEDESK_SIGNIN_ANONYMOUSLY = this.SERVER_BASE_URL + 'auth/signinAnonymously'
    this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'auth/signinWithCustomToken';
  }


  /**
   * @param email
   * @param password
   */
  signInWithEmailAndPassword(email: string, password: string): Promise<string> {
    this.logger.debug('[TILEDESK-AUTH]-SERV] - signInWithEmailAndPassword', email, password);
    const httpHeaders = new HttpHeaders();

    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json');
    const requestOptions = { headers: httpHeaders };
    const postData = {
      email: email,
      password: password
    };
    const that = this;
    return new Promise((resolve, reject) => {
      this.http.post(this.URL_TILEDESK_SIGNIN, postData, requestOptions).subscribe((data) => {
        if (data['success'] && data['token']) {
          that.tiledeskToken = data['token'];
          that.createCompleteUser(data['user']);
          that.appStorage.setItem('tiledeskToken', that.tiledeskToken);
          resolve(that.tiledeskToken)
        }
      }, (error) => {
        reject(error)
      });
    });
  }


  /**
   * @param projectID
   */
  signInAnonymously(projectID: string): Promise<string> {
    this.logger.debug('[TILEDESK-AUTH] - signInAnonymously - projectID', projectID);
    const httpHeaders = new HttpHeaders();

    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json');
    const requestOptions = { headers: httpHeaders };
    const postData = {
      id_project: projectID
    };
    const that = this;
    return new Promise((resolve, reject) => {
      this.http.post(this.URL_TILEDESK_SIGNIN_ANONYMOUSLY, postData, requestOptions).subscribe((data) => {
        if (data['success'] && data['token']) {
          that.tiledeskToken = data['token'];
          that.createCompleteUser(data['user']);
          that.appStorage.setItem('tiledeskToken', that.tiledeskToken);
          resolve(that.tiledeskToken)
        }
      }, (error) => {
        reject(error)
      });
    })

  }

  /**
   * @param tiledeskToken
   */
  signInWithCustomToken(tiledeskToken: string): Promise<UserModel> {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: tiledeskToken
    });
    const requestOptions = { headers: headers };
    const that = this;
    return new Promise((resolve, reject) => {
      this.http.post(this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN, null, requestOptions).subscribe((data) => {
        if (data['success'] && data['token']) {
          that.tiledeskToken = data['token'];
          that.createCompleteUser(data['user']);
          that.appStorage.setItem('tiledeskToken', that.tiledeskToken); // salvarlo esternamente nell'app.component
          resolve(this.currentUser)
        }
      }, (error) => {
        reject(error)
      });
    });
  }

  logOut(){
    this.logger.debug('[TILEDESK-AUTH] logOut()');
    this.appStorage.removeItem('tiledeskToken');
    this.appStorage.removeItem('currentUser');
    this.setCurrentUser(null);
  }


  /**
   * createCompleteUser
   * @param user
   */
  private createCompleteUser(user: any) {
    const member = new UserModel(user._id);
    try {
      const uid = user._id;
      const firstname = user.firstname ? user.firstname : '';
      const lastname = user.lastname ? user.lastname : '';
      const email = user.email ? user.email : '';
      const fullname = (firstname + ' ' + lastname).trim();
      const avatar = avatarPlaceholder(fullname);
      const color = getColorBck(fullname);

      member.uid = uid;
      member.email = email;
      member.firstname = firstname;
      member.lastname = lastname;
      member.fullname = fullname;
      member.avatar = avatar;
      member.color = color;
      this.currentUser = member; 
      this.logger.debug('[TILEDESK-AUTH] - createCompleteUser member ', member)
      this.appStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    } catch (err) {
      this.logger.error('[TILEDESK-AUTH]- createCompleteUser ERR ', err) 
    }
    
  }


  getCurrentUser(): UserModel {
    return this.currentUser;
  }
  setCurrentUser(user: UserModel) {
    this.currentUser = user;
  }
  getTiledeskToken(): string {
    return this.tiledeskToken;
  }

}
