import { Place } from './../place.model';
import { PlacesService } from './../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {

  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  private placesSubscription$: Subscription;
  relevantPlaces: Place[];
  private chosenFilter = 'all';
  isloading = false;

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authSerive: AuthService) { }

  ngOnInit() {
   this.placesSubscription$ = this.placesService.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
        // if (this.chosenFilter === 'all') {
        //   this.relevantPlaces = this.loadedPlaces;
        //   this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        // } else {
        //   this.relevantPlaces = this.loadedPlaces.filter(
        //     place => place.userId !== this.authSerive.userId
        //   );
        // }
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      });
  }

  ionViewWillEnter() {
   this.isloading = true;
   this.placesService.fetchPlaces().subscribe(() => {
     this.isloading = false;
   });

  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFileterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authSerive.userId.pipe(take(1)).subscribe(userId => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        this.chosenFilter = 'all';
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          place => place.userId !== userId
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        this.chosenFilter = 'bookable';
      }
    });
  }

  ngOnDestroy() {
    if (this.placesSubscription$) {
      this.placesSubscription$.unsubscribe();
    }
  }
}
