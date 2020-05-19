import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { Plugins, Capacitor, CameraSource, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { } from '@ionic/pwa-elements';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {

  selecetdImage: string;
  usePicker = false;
  @Output() imagePick = new EventEmitter<string | File>();
  @ViewChild('filePicker', { static: false}) filePickerRef: ElementRef<HTMLInputElement>;
  @Input() showPreview = false;
  constructor(private platfrom: Platform) { }

  ngOnInit() {
    console.log('Mobile', this.platfrom.is('mobile'));
    console.log('Hybrid', this.platfrom.is('hybrid'));
    console.log('IOS', this.platfrom.is('ios'));
    console.log('Android', this.platfrom.is('android'));
    console.log('Desktop', this.platfrom.is('desktop'));
    if ((this.platfrom.is('mobile') && !this.platfrom.is('hybrid')) || this.platfrom.is('desktop')) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.DataUrl
    }).then( image => {
      this.selecetdImage = image.dataUrl;
      this.imagePick.emit(image.dataUrl);
    })
    .catch( error => {
      console.log(error);
      if (this.usePicker) {
        this.filePickerRef.nativeElement.click();
      }
      return false;
    });

  }
  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selecetdImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
  }
}
