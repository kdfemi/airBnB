import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {


  @ViewChild('map', {static: false}) mapElemeRef: ElementRef;
  @Input() center = { lat: -34.397, lng: 150.64};
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
  clickListener: any;
  googleMaps: any;

  constructor(
    public modalController: ModalController,
    private renderer: Renderer2
  ) { }


  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps()
    .then(googleMaps => {
      this.googleMaps = googleMaps;
      const mapElement = this.mapElemeRef.nativeElement;
      const map = new googleMaps.Map(mapElement, {
        center: this.center,
        zoom: 16
      });
      googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapElement, 'visible');
      });

      if (this.selectable) {
        this.clickListener = map.addListener('click', event => {
          const selectedCoords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          this.modalController.dismiss(selectedCoords);
        });
      } else {
        const marker = new googleMaps.Marker({
          position: this.center,
          map,
          title: 'Picked Location'
        });
        marker.setMap(map);
      }

    })
    .catch(err => console.log(err));
  }

  ngOnDestroy() {
    if (this.selectable) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

  onCancel() {

    this.modalController.dismiss();

  }
  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((res, rej) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsAPIKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          return res(loadedGoogleModule.maps);
        } else {
          return rej('Google maps SDK not available');
        }
      };
    });
  }

}
