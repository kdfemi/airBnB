import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation, Coordinates } from 'src/app/places/location.model';
import { of } from 'rxjs';
import { Plugins, Capacitor } from '@capacitor/core';
@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  selecetdLocationImage: string;
  isLoading = false;

  @Output()locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
  ) { }

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetController.create({
      header: 'Please Choose',
      buttons: [{
        text: 'Auto-Locate',
        handler: () => {
          if (!Capacitor.isPluginAvailable('Geolocation')) {
           this.showError();
           return;
          }
          this.isLoading = true;
          Plugins.Geolocation.getCurrentPosition()
          .then(geoPosition => {
            const coordinates: Coordinates = {
              lat: geoPosition.coords.latitude,
              lng: geoPosition.coords.longitude
            };
            this.createPlace(coordinates.lat, coordinates.lng);
            this.isLoading = false;
          })
          .catch(err => {
            this.isLoading = false;
            this.showError();
          });
        }
      }, {
        text: 'Pick on Map',
        handler: () => {
          this.openMap();
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
      }
      ]
    }).then( actionSheetElement => {
      actionSheetElement.present();
    });
    }

  private showError() {
    this.alertController.create({
      header: 'Could not fetech location',
      message: 'Do you want to pick manually?',
      buttons: [
        {
          text: 'Cancel', role: 'cancel'
        }, {
          text: 'Ok',
          handler: () => {
            this.openMap();
          }
        }
      ]
    }).then( alertElement => alertElement.present());
  }

    private getAddress(lat: number, lng: number) {
      return this.http.get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},-${lng}&key=${environment.googleMapsAPIKey}`
        ).pipe( map( geoData => {
          if (!geoData || !geoData.results || geoData.results.length <= 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        }));
    }
    private locateUser() {

    }

    private openMap() {
      this.modalController.create({
        component: MapModalComponent,
        componentProps: { value: 123 }
        }).then((modalElement) => {
          modalElement.present();
          modalElement.onDidDismiss().then(modaldata => {
            if (!modaldata.data) {
              return;
            }
            this.createPlace(modaldata.data.lat, modaldata.data.lng);
          });
        });
    }

  private createPlace(lat: number, lng: number) {

    this.isLoading = true;
    const pickedLocation: PlaceLocation = {
      lat,
      lng,
      address: null,
      staticMapImageUrl: null
    };
    this.getAddress(lat, lng).pipe(switchMap(address => {
      pickedLocation.address = address;
      return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
    })).subscribe(staticMapImageUrl => {
      pickedLocation.staticMapImageUrl = staticMapImageUrl;
      this.selecetdLocationImage = staticMapImageUrl;
      this.isLoading = false;
      this.locationPick.emit(pickedLocation);
    });
  }

    private getMapImage(lat: number, lng: number, zoom: number) {

      return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
      &markers=color:red%7Clabel:Place%7C${lat},${lng}&key=${environment.googleMapsAPIKey}`;
    }
}
