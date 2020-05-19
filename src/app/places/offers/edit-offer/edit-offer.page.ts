import { PlacesService } from './../../places.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Place } from './../../place.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  place: Place;
  form: FormGroup;
  isloading = false;
  placeId: string;
  private placeSubscription$: Subscription;
  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      (paramMap) => {
        if (!paramMap.has('placeId')) {
          this.navCtrl.navigateBack('/places/tabs/offers');
          return;
        }
        this.placeId = paramMap.get('placeId');
        this.isloading = true;
        this.placeSubscription$ = this.placesService.getPlace(this.placeId)
        .subscribe((place) => {
            this.place = place;
            this.form = new FormGroup({
              title: new FormControl(this.place.title, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              description: new FormControl(this.place.description, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(180)]
              })
            });
            this.isloading = false;
          }, error => {
            console.log('error');
            this.alertController.create({
              header:  'An error occoured',
              message: 'Place could not be tetched. place try again',
              buttons: [
                {
                  text: 'Ok',
                  handler: () => {
                  this.router.navigate(['/places/tabs/offers']);
                }}]
            }).then(
              (alertElement) => {
                alertElement.present();
              }
            );
          });
      });
  }
  onUpdateOffer() {
    if (this.form.invalid) {
      return;
    }
    this.loadingController.create({
      message: 'Updating',
      spinner: 'bubbles'
    }).then(
      (loadingElem) => {
        loadingElem.present();
        this.placesService.updatePlace(
          this.place.id,
          this.form.value.title,
          this.form.value.description)
        .subscribe(
          () => {
            loadingElem.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });

    console.log(this.form);
  }

  ngOnDestroy() {
    if (this.placeSubscription$) {
      this.placeSubscription$.unsubscribe();
    }
  }
}
