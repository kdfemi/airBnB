import { AuthService } from './auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  isLoading = false;
  isLogin = true;
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertController: AlertController) { }

  ngOnInit() {
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    // this.authService.login(email, password);
    this.loadingCtrl.create(
      {keyboardClose: true, message: 'logging in'}
    ).then(
      (loadingEle) => {
        loadingEle.present();
        if (this.isLogin) {

            this.authService.login(email, password).subscribe(
              resData => {
                // console.log(resData)
                this.isLoading = false;
                loadingEle.dismiss();
                this.router.navigateByUrl('/places/tabs/discover');
              },
              errResponse => {
                if (errResponse) {
                  const {error} = errResponse.error;
                  this.showAlert(error.message, 'Authentication failed');
                  loadingEle.dismiss();
                } else {
                  this.showAlert('You are not connected to the internet', 'Network Error');
                  loadingEle.dismiss();
                }
              }
            );

        } else {
          this.authService.signup(email, password).subscribe(
            resData => {
              // console.log(resData)
              this.isLoading = false;
              loadingEle.dismiss();
              this.router.navigateByUrl('/places/tabs/discover');
            },
            errResponse => {
              if (errResponse) {
                const {error} = errResponse.error;
                this.showAlert(error.message, 'Authentication failed');
                loadingEle.dismiss();
              } else {
                this.showAlert('You are not connected to the internet', 'Network Error');
                loadingEle.dismiss();
              }
            }
          );
        }
      }
    );

      }
      onSubmit(form: NgForm) {

        if (!form.valid) {
          return;
        }
        const email = form.value.email;
        const password = form.value.password;
        // if (this.isLogin) {
        //   this.authenticate(email, password);
        // } else {
        form.reset();
        this.authenticate(email, password);
        // }
      }

      onSwitchAuthMode() {
        this.isLogin = !this.isLogin;
      }

      private showAlert(message: string, header: string) {
        this.alertController.create({
          header,
          message,
          buttons: ['Ok']
        }). then(
          (alertElem) => {
            alertElem.present();
          });
      }
}
