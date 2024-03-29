import { Injectable, OnDestroy, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { baseFilter } from 'src/app/_fake/fake-helpers/http-extenstions';
import { ITableState, PaginatorState, SortState, GroupingState, TableService, TableResponseModel } from 'src/app/_metronic/shared/crud-table';
import { environment } from 'src/environments/environment';
import { Lesson } from '../_models/lessions.model';

const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: '',
  grouping: new GroupingState(),
  entityId: undefined
};


@Injectable({
  providedIn: 'root'
})
export class ManageLessonsService extends TableService<Lesson> implements OnDestroy {
  private lessonData$ = new BehaviorSubject<object>({});
  private lessonArray$ = new BehaviorSubject<[]>([]);

  API_URL = `${environment.apiUrl}/lesson`;
  API_URL_MASTERS = `${environment.apiUrl}/master`
  constructor(@Inject(HttpClient) http,@Inject(Router) router) {
    super(http,router);
  }


  loadMasters(): Observable<any> {
    const grade = this.http.get(this.API_URL_MASTERS + '/grade');
    const language = this.http.get(this.API_URL_MASTERS + '/language');
    return forkJoin([grade, language]);
  }
  // READ
  find(tableState: ITableState): Observable<TableResponseModel<Lesson>> {
    return this.http.get<Lesson[]>(this.API_URL).pipe(
      map((response: any) => {
        const filteredResult = baseFilter(response.data, tableState);
        const result: TableResponseModel<Lesson> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }

  findLessonsByFilter(tableState: ITableState, id, filter): Observable<TableResponseModel<Lesson>> {
    return this.http.get<Lesson[]>(this.API_URL + '?filters[root]=[{"f":"' + filter + '","v":' + id + '},{"f":"isPermanentDeleted","v":false}]&fields[root]=["id","lessonTitle","status","isDeleted"]').pipe(
      map((response: any) => {
        const filteredResult = baseFilter(response.data, tableState);
        const result: TableResponseModel<Lesson> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }

  deleteItems(ids: number[] = []): Observable<any> {
    const tasks$ = [];
    ids.forEach(id => {
      tasks$.push(this.delete(id));
    });
    return forkJoin(tasks$);
  }



  updateStatusForItems(ids: number[], status: any): Observable<any> {
    return this.http.get<Lesson[]>(this.API_URL).pipe(
      map((Lesson: Lesson[]) => {
        return Lesson.filter(c => ids.indexOf(c.id) > -1).map(c => {
          c.status = status;
          return c;
        });
      }),
      exhaustMap((Lesson: Lesson[]) => {
        const tasks$ = [];
        Lesson.forEach(tool => {
          tasks$.push(this.update(tool));
        });
        return forkJoin(tasks$);
      })
    );
  }

  updateItems(id: number[], recipes: any): Observable<any> {
    return this.http.get<Lesson[]>(this.API_URL).pipe(
      map((Lesson: any[]) => {
        return Lesson.filter(c => id.indexOf(c.id) > -1).map(c => {
          console.log(c);
          c.recipes = recipes;
          return c;
        });
      }),
      exhaustMap((Lesson: Lesson[]) => {
        const tasks$ = [];
        Lesson.forEach(tool => {
          tasks$.push(this.update(tool));
        });
        return forkJoin(tasks$);
      })
    );
  }

  getLessonCount() {
    this.http.get<any[]>(this.API_URL + '/byGrade').subscribe((res:any)=>{
      this.setlessonArray(res.data);
    })
  }
  
  getStandardBySubject(){
    const elastandards= this.http.get<any[]>(environment.apiUrl+ '/standard?filters[subjects]=[{"f":"title","v":"ELA"}]&sorting[root]=[{"f":"standardTitle","o":"ASC"}]');
    const mathStandards= this.http.get<any[]>(environment.apiUrl+ '/standard?filters[subjects]=[{"f":"title","v":"MATH"}]&sorting[root]=[{"f":"standardTitle","o":"ASC"}]');
    const ngssStandards= this.http.get<any[]>(environment.apiUrl+ '/standard?filters[subjects]=[{"f":"title","v":"NGSS"}]&sorting[root]=[{"f":"standardTitle","o":"ASC"}]');
    const ncssStandards= this.http.get<any[]>(environment.apiUrl+ '/standard?filters[subjects]=[{"f":"title","v":"NCSS"}]&sorting[root]=[{"f":"standardTitle","o":"ASC"}]');
    return forkJoin([elastandards,mathStandards,ngssStandards,ncssStandards])
  }

  getRecipeMaster(){
    const countries= this.http.get(environment.apiUrl + '/country?sorting[root]=[{"f":"countryName","o":"ASC"}]');
    const tools = this.http.get(environment.apiUrl + '/tool?sorting[root]=[{"f":"toolTitle","o":"ASC"}]');
    return forkJoin([countries, tools]);
  }

  getExperimentMaster(){
    const tools = this.http.get(environment.apiUrl + '/tool?sorting[root]=[{"f":"toolTitle","o":"ASC"}]');
    const ingredients = this.http.get(environment.apiUrl + '/ingredient?sorting[root]=[{"f":"ingredientTitle","o":"ASC"}]');
    return forkJoin([tools,ingredients]);
  }

  getIngredientMaster(){
    const unitOfMeasure = this.http.get(environment.apiUrl + '/unitOfMeasurement?sorting[root]=[{"f":"unitOfMeasure","o":"ASC"}]');
    const ingredients = this.http.get(environment.apiUrl + '/ingredient?sorting[root]=[{"f":"ingredientTitle","o":"ASC"}]');
    return forkJoin([unitOfMeasure,ingredients]);
  }

  getTechniqueMaster(){
    const techniques = this.http.get(environment.apiUrl + '/culinaryTechnique? sorting[root]=[{"f":"culinaryTechniqueTitle","o":"ASC"}]');
    return forkJoin([techniques]);
  }

  // Getters
  get _getlessonArray$() {
    return this.lessonArray$.asObservable()
  }

  setlessonArray(data) {
    this.lessonArray$.next(data)
  }

  // Getters
  get _getlessonData$() {
    return this.lessonData$.asObservable();
  }

  setlessonData(data) {
    this.lessonData$.next(data)
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
