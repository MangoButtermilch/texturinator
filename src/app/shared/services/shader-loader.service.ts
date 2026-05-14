import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShaderLoaderService {

  private shaderCache = new Map<string, string>();

  constructor(private http: HttpClient) { }

  private loadShader(url: string): Observable<string> {
    if (this.shaderCache.has(url)) { 
      return of(this.shaderCache.get(url));
    }

    return this.http.get(url, { responseType: 'text' })
      .pipe(
        tap((content: string) => {
          if (!this.shaderCache.has(url)) this.shaderCache.set(url, content);
        })
      );
  }

  public async loadShaders(shaderMap: Record<string, string>): Promise<Record<string, string>> {
    const entries = Object.entries(shaderMap);
    const loadedEntries = await Promise.all(
      entries.map(async ([key, url]) => {
        const code = await firstValueFrom(this.loadShader(url).pipe(take(1)));
        return [key, code] as [string, string];
      })
    );

    return Object.fromEntries(loadedEntries);
  }
}
