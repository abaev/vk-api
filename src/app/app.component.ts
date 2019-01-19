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
	friendsIds: number[];
	errorMessage: string | number;

	httpOptions = {
	  headers: new HttpHeaders({
	    'Accept':  'application/json'
	  })
	};

  constructor(@Inject('VK') private vk: any,
  	private http: HttpClient) {}

  
  ngOnInit() {
  	this.vk.init({
	    apiId: 6824974
	  });
  }

  
  vkAuth() {
  	this.login().subscribe(response => { 
  		console.log('VK Auth response ', response);
  		this.status = response.status;
  		this.firstName = response.session.user.first_name;
  		this.lastName = response.session.user.last_name;
  		this.nickname = response.session.user.nickname;
  		this.userHref = response.session.user.href;
  		this.getFriends(response.session.user.id).subscribe(response => {
  			console.log('Friends: ', response);
  			this.friendsIds = response.response.items;

  		}, err => { this.errorMessage = err; })

  	}, error => {
  		console.log('VK Auth error', error);
  	});

  	// this.oAuthLogin().subscribe(response => {
  	// 	console.log('VK OAuth: ', response);
  	// });
  }

  
  login(): Observable<any> {
		return from(new Promise(resolve => {
			this.vk.Auth.login(response => {
					resolve(response);
				}, 2); /* 2 - Доступ к друзьям */
			})
		);
	}


	getFriends(userId): Observable<any> {
		return from(new Promise(resolve => {
			this.vk.Api.call('friends.get', {user_id: userId, v:"5.73"}, response => {
					resolve(response);
				});
			})
		);
	}



	oAuthLogin(): Observable<any> {
		return this.http.get('https://oauth.vk.com/authorize?client_id=6824974&redirect_uri=https://abaev.github.io/&scope=friends&v=5.92'/*,
  		{ withCredentials: true }*/)
  			.pipe(catchError(this.handleError));
	}


	// getFriends(userId): Observable<any> {
 //  	return this.http.get('https://api.vk.com/method/friends.get?user_id=' + userId/*,
 //  		{ withCredentials: true }*/
 //  		, this.httpOptions)
 //  			.pipe(catchError(this.handleError));
 //  }


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
