import { Booking } from './booking.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingData {
    bookedFrom: string;
    bookedTo: string;
    guestNumber: number;
    firstname: string;
    lastname: string;
    placeId: string;
    placeImage: string;
    placeTitle: string;
    userId: string;
}

@Injectable(
    {
        providedIn: 'root'
    }
)
export class BookingService {

    // tslint:disable-next-line: variable-name
    private _bookings = new BehaviorSubject<Booking[]>([]);

    constructor(private authService: AuthService,
                private http: HttpClient) {}

    get bookings() {
        return this._bookings.asObservable();
    }

    fetchBookings() {
        let fetechedUserId: string;
        return this.authService.userId.pipe(take(1), switchMap( userId => {
            if (!userId) {
                throw new Error('User not found');
            }
            fetechedUserId = userId;
            return this.authService.token;
        }), take(1), switchMap(token => {
            return this.http.get<{[key: string]: BookingData}>
            (`https://ionic-angular-course-15486.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetechedUserId}"&auth=${token}`);
        }),
        map(bookingData => {
            const bookings = [];
            for (const key in bookingData) {
                if (bookingData.hasOwnProperty(key)) {
                    bookings.push(new Booking(
                        key,
                        bookingData[key].placeId,
                        bookingData[key].userId,
                         bookingData[key].placeTitle,
                         bookingData[key].placeImage,
                         bookingData[key].firstname,
                         bookingData[key].lastname,
                         bookingData[key].guestNumber,
                         new Date(bookingData[key].bookedFrom),
                         new Date(bookingData[key].bookedTo)));
                }
            }
            return bookings;
            }), tap(bookings => {
                this._bookings.next(bookings);
            }
            )

        );
    }

    addBooking(
        placeId: string,
        placeTitle: string,
        placeImage: string,
        firstname: string,
        lastname: string,
        guestNumber: number,
        dateFrom: Date,
        dateTo: Date) {
            let generatedId: string;
            let newBooking: Booking;
            let fetchedUserId: string;
            return this.authService.userId.pipe(take(1),
            switchMap(userId => {
                if (!userId) {
                    throw new Error('No user id found!');
                }
                fetchedUserId = userId;
                return this.authService.token;
            }), take(1), switchMap(token => {
                newBooking = new Booking(
                    Math.random().toString(),
                    placeId,
                    fetchedUserId,
                    placeTitle,
                    placeImage,
                    firstname,
                    lastname,
                    guestNumber,
                    dateFrom,
                    dateTo);
                return this.http.post<{name: string}>(`https://ionic-angular-course-15486.firebaseio.com/bookings.json?auth=${token}`,
                    {...newBooking, id: null});
            }),
            switchMap((resData) => {
                generatedId = resData.name;
                return this.bookings;
            }),
            take(1),
            tap(bookings => {
                    newBooking.id = generatedId;
                    this._bookings.next(bookings.concat(newBooking));
                       })
            );
    }

    cancelBooking(bookingId: string) {
        return this.authService.token.pipe(take(1), switchMap(token => {
            return this.http.delete(`https://ionic-angular-course-15486.firebaseio.com/bookings/${bookingId}.json?auth=${token}`);
        }), switchMap(() => {
                return this.bookings;
            }), take(1), tap( bookings => {
                this._bookings.next(bookings.filter(book => book.id !== bookingId));
            })
        );
    }
}
