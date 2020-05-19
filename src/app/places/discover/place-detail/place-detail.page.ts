import { PlacesService } from './../../places.service';
import { Place } from './../../place.model';
import { CreateBookingComponent } from './../../../bookings/create-booking/create-booking.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Button } from 'protractor';
import { Subscription, VirtualTimeScheduler } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

  private placeSubscription$: Subscription;
  place: Place;
  isBookable = false;
  isloading = false;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingController: LoadingController,
    private authService: AuthService,
    private alertController: AlertController ) { }

  ngOnInit() {

    this.route.paramMap.subscribe(
      (paramMap) => {
        if (!paramMap.has('placeId')) {
          this.navCtrl.navigateBack('/places/tabs/discover');
          return;
        }

        this.isloading = true;
        let fetehedUserId: string;

        this.authService.userId.pipe( take(1), switchMap( userId => {
          if (!userId) {
            throw new Error('No user found');
          }
          fetehedUserId = userId;
          return  this.placesService.getPlace(paramMap.get('placeId'));
        })).subscribe(
         (place) => {
           this.place = place;
           this.isBookable = place.userId !== fetehedUserId;
           this.isloading = false;
          }, error => {
            this.alertController.create({
                header: 'An error occured',
                message: 'Could not load page',
                buttons: [{
                  text: 'Ok',
                  handler: () => this.router.navigate(['/places/tabs/discover'])
                }]
              }).then(
                (alert) => {
                  alert.present();
                }
              );
            }
       );
      });
  }
  onBookPlace() {
    // this.router.navigateByUrl('places/tabs/discover');
    // this.navCtrl.navigateBack('places/tabs/discover');
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Selete Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(
      (actionSheetElm) => {
        actionSheetElm.present();
      }
    );
  }

  openBookingModal(mode: 'select' | 'random') {

    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {
        selectedPlace: this.place,
        selectedMode: mode
      }})
    .then( modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    }).then(
      resultData => {
        if (resultData.role === 'confirm') {
          const data = resultData.data.bookingData;
          console.log(data.lastName);
          this.loadingController.create({
            message: 'Adding booking',
            spinner: 'dots'
          }).then(
            loadingElement => {
              loadingElement.present();
              this.bookingService.addBooking(
                this.place.id,
                this.place.title,
                this.place.imageUrl,
                data.firstName,
                data.lastName,
                data.guestNumber,
                data.startDate,
                data.endDate).subscribe(
                  () => loadingElement.dismiss()
                );
            });
        }
      }
    );
  }

  onShowFullMap() {
     this.modalCtrl.create({
     component: MapModalComponent,
     componentProps: {
      center: { lat: this.place.location.lat, lng: this.place.location.lng},
      selectable: false,
      closeButtonText: 'Close',
      title: this.place.location.address
     }
     }).then((modalElement) => {
       modalElement.present();
     }
     );
  }

  ngOnDestroy() {
    if (this.placeSubscription$) {
      this.placeSubscription$.unsubscribe();
    }
  }
}
