import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { HttpClientModule } from '@angular/common/http';
import { AutoscrollDirective } from './autoscroll.directive';
import { NgxTypedJsModule } from 'ngx-typed-js';

@NgModule({
  declarations: [
    AppComponent,
    ChatboxComponent,
    AutoscrollDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxTypedJsModule
  ],
  providers: [
    { provide: "baseUrl", useValue: "APIURL/api", multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
