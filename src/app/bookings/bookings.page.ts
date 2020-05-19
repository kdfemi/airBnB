import { Booking } from './booking.model';
import { BookingService } from './booking.service';
import { Place } from './../places/place.model';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {

  loadedBookings: Booking[];
  bookSubscription$: Subscription;
  isloading = false;
  constructor(
    private bookingService: BookingService,
    private loadingControl: LoadingController) { }

  ngOnInit() {
    this.bookSubscription$ = this.bookingService.bookings.subscribe(
      bookings => this.loadedBookings = bookings
    );
  }

  ionViewWillEnter() {
    this.isloading = true;
    this.bookingService.fetchBookings().subscribe(
     () => {
       this.isloading = false;
     }
   );
  }

  onCancelBooking(bookingId: string, slidingElement: IonItemSliding) {

    slidingElement.close();
    this.loadingControl.create(
      {
        message: 'Deleting Booking',
        spinner: 'bubbles'
      }
    ).then(
      (loadingElement) => {
        loadingElement.present();
        return loadingElement;
      }).then(
        (loadingElement) => {
          this.bookingService.cancelBooking(bookingId).subscribe(
            () => loadingElement.dismiss()
          );
        });
  }

  ngOnDestroy() {
    if (!this.bookSubscription$) {
      this.bookSubscription$.unsubscribe();
    }
  }
}
