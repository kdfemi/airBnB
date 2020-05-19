import { PlacesService } from './../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  constructor(private placeService: PlacesService, private router: Router) { }

  loadedPlace: Place[];
  isloading = false;
  private placesSubscription$: Subscription;
  ngOnInit() {
    this.placesSubscription$ = this.placeService.places.subscribe(
      places => {
        this.loadedPlace = places;
      }
    );
  }

  ionViewWillEnter() {
    this.isloading = true;
    this.placeService.fetchPlaces().subscribe(
     () => this.isloading = false
   );
  }

  ngOnDestroy() {
    if (this.placesSubscription$) {
      this.placesSubscription$.unsubscribe();
    }
  }
  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/places', 'tabs', 'offers', 'edit', offerId]);
    console.log('editing item', offerId);
  }
}
