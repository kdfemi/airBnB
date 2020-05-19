export class Booking {
    constructor(
        public id: string,
        public placeId: string,
        public userId: string,
        public placeTitle: string,
        public placeImage: string,
        public firstname: string,
        public lastname: string,
        public guestNumber: number,
        public bookedFrom: Date,
        public bookedTo: Date
        ) {}
}
