import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlaceLocation } from './location.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // [
  //   new Place('p1', 'Manhattan Mansion', 'In the heart of New York City.',
  //   'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg', 149.99,
  //   new Date('2019-01-01'), new Date('2019-12-31'), 'abc'),
  //   new Place('p2', 'L\'Amour Toujours', 'A romantic place in Paris!',
  //   'https://1001005.v1.pressablecdn.com/wp-content/uploads/2011/10/Plaza_Athenee_Paris1.jpg', 189.99,
  //   new Date('2019-01-01'), new Date('2019-12-31'), 'abc'),
  //   new Place('p3', 'The Foggy Palace', 'Not your average city trip!',
  //   'https://victortravelblogdotcom.files.wordpress.com/2015/01/pena-palace-in-fog-sintra-portugal-42.jpg?w=584', 99.99,
  //   new Date('2019-01-01'), new Date('2019-12-31'), 'abc'),
  // ]
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
   return this.authService.token.pipe(take(1), switchMap(token => {

      return this.http.get<{[key: string]: PlaceData}>
      (`https://ionic-angular-course-15486.firebaseio.com/offered-places.json?auth=${token}`);
    }),
      map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key, resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
                resData[key].location));
          }
        }
        return places;
      }), tap(
        places => {
          this._places.next(places);
        }
      )
    );
  }

  getPlace(placeId: string) {
   return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http.get<PlaceData>
      (`https://ionic-angular-course-15486.firebaseio.com/offered-places/${placeId}.json?auth=${token}`);

    }), map( place => {
        return new Place(
          placeId,
          place.title,
          place.description,
          place.imageUrl,
          place.price,
          new Date(place.availableFrom),
          new Date(place.availableTo),
          place.userId,
          place.location);
      })
    );

  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(take(1), switchMap(token => {
      const header = {
        headers: new HttpHeaders()
          .set('Authorization',  `Bearer ${token}`)
      };
      console.log(header);
      return this.http.post<{imageUrl: string, imagePath: string}>
      ('https://us-central1-ionic-angular-course-15486.cloudfunctions.net/storeImage', uploadData,
      header);
    }));
  }
  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string) {
    let generatedId: string;
    let fetchedUserId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(take(1),
    switchMap(userId => {
      fetchedUserId = userId;
      return this.authService.token;
    }), take(1),
    switchMap(token => {
      if (!fetchedUserId) {
        throw new Error ('No user Found');
      }
      newPlace = new Place(
        Math.random().toString(),
        title,
        description,
        imageUrl,
        price,
        dateFrom,
        dateTo,
        fetchedUserId,
      location);
      return this.http.post<{name: string}>(`https://ionic-angular-course-15486.firebaseio.com/offered-places.json?auth=${token}`,
      {...newPlace, id: null});
    }),
    switchMap(
        respData => {
          generatedId = respData.name;
          return this.places;
      }),
    take(1),
    tap(
      places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      }
      )
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlace: Place[];
    let fetchedToken: string;
    return this.authService.token.pipe(take(1), switchMap(token => {
      fetchedToken = token;
      return this.places;
    }), take(1), switchMap(
      places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }
    ), switchMap(
      places => {
        const updatedPlaceIndex = places.findIndex( pl => pl.id === placeId );
        updatedPlace = [...places];
        const oldPlace = updatedPlace[updatedPlaceIndex];
        updatedPlace[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location);
        return this.http.put<PlaceData>
        (`https://ionic-angular-course-15486.firebaseio.com/offered-places/${placeId}.json?auth=${fetchedToken}`,
        {...updatedPlace[updatedPlaceIndex], id: null} );
      }
    ), tap(
      () => {
        this._places.next(updatedPlace);
      }
    ));
  }
}
