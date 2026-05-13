import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  public saveLocalSetting(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  public getLocalSetting(key: string): string | null {
    return localStorage.getItem(key);
  }

  public saveSessionSetting(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  public getSessionSetting(key: string): string | null {
    return sessionStorage.getItem(key);
  }

}
