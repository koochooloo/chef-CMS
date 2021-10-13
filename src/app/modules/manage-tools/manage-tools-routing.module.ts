import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageToolsComponent } from './manage-tools.component';

const routes: Routes = [
  {
    path: '', component: ManageToolsComponent
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageToolsRoutingModule { }
