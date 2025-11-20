import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../../interfaces/role.interface';


@Injectable({
  providedIn: 'root'
})
export class RoleService {

  urlRoles = 'http://localhost:8080/api/roles';

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<any> {
    return this.http.get<Role[]>(this.urlRoles);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.urlRoles}/${id}`);
  }


}
