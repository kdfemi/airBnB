import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NewOfferPage } from './new-offer.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ImagePickerComponent } from 'src/app/shared/pickers/image-picker/image-picker.component';

const routes: Routes = [
  {
    path: '',
    component: NewOfferPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [NewOfferPage]
})
export class NewOfferPageModule {}
