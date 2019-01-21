import { Component, OnInit, Inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	firstName: string;
	lastName: string;
	nickname: string;
	userHref: string;
	status: string;
	friends: number[];
	errorMessage: string | number;

  constructor(@Inject('VK') private vk: any,
  	private http: HttpClient) {}

  
  ngOnInit() {
  	// Инициализвция API
  	this.vk.init({
	    apiId: 6824974
	  });
  }

  
  vkAuth() {
  	this.login().subscribe(response => { 
  		// console.log('VK Auth response ', response);
  		this.status = response.status;
  		if(this.status == 'connected') {
  			this.firstName = response.session.user.first_name;
	  		this.lastName = response.session.user.last_name;
	  		this.nickname = response.session.user.nickname;
	  		this.userHref = response.session.user.href;

	  		this.getFriends({userId: response.session.user.id, fields: 'photo_50'}).subscribe(response => {
	  			// console.log('Friends: ', response);
	  			this.friends = response.response;

	  		}, err => { this.errorMessage = err; });
  		}

  	}, error => {
  		console.error('VK Auth error', error);
  	});

  }

  
  login(): Observable<any> {
		return from(new Promise(resolve => {
			this.vk.Auth.login(response => {
					resolve(response);
				}, 2); /* 2 - Доступ к друзьям */
			})
		);
	}


	getFriends(options: any): Observable<any> {
		return from(new Promise(resolve => {

			// Получаем список ID друзей
			this.vk.Api.call('friends.get', {user_id: options.userId, v: '5.73'}, response => {

					// Получаем информацию о друзьях
					this.vk.Api.call('users.get',
						{ 
							user_ids: response.response.items.join(','),
							fields: options.fields,
							v: '5.73'
						}, response => {
							resolve(response);		
						});
				});
			})
		);
	}


	private handleError(error: HttpErrorResponse) {
  	let message: string | number;
	  
	  if (error.error instanceof ErrorEvent) {
	    // A client-side or network error occurred. Handle it accordingly.
	    // message = 'An error occurred:'+ error.error.message
	    message = 'A client-side or network error occurred';
	  } else {
	    // The backend returned an unsuccessful response code.
	    // code =  error.status
      // body = error.error
	    message = error.status;
	  }
	  return throwError(message);
	};
}
