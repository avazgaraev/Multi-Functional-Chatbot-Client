import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AudioConfig, CancellationDetails, CancellationReason, ResultReason, SpeechConfig, SpeechRecognizer, SpeechSynthesisResult, SpeechSynthesizer } from 'microsoft-cognitiveservices-speech-sdk';
import { TypingAnimatorDirective } from 'angular-typing-animator';
import { saveAs } from 'file-saver';
import { Observable, map } from 'rxjs';

declare let SpeechSynthesisUtterance: any;

interface Message {
  from?: string;
  text: string;
}


@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})

export class ChatboxComponent implements OnInit {
  @ViewChild('chatWindow') chatWindow: ElementRef;
  @ViewChild('typingAnimator') typingAnimator: TypingAnimatorDirective;
  messages: Message[] = [];
  inputFile: File;
  outputFile: File;

  private speechConfig = SpeechConfig.fromSubscription("subsKey", "eastus");
  private speechRecognizer = new SpeechRecognizer(this.speechConfig);
  private speechSynthesizer = new SpeechSynthesizer(this.speechConfig);

  constructor(private http: HttpClient, @Inject("baseUrl") private baseUrl: string) { }

  ngOnInit(): void {
  }

  isReturned: boolean = true;
  isStarted: boolean = false;
  isVoice: boolean = false;
  async sendMessage(event?, text?) {
    this.isReturned = false;
    if (event && event.key !== 'Enter') {
      return;
    }


    const inputBox = this.chatWindow.nativeElement.querySelector('input');
    var message = inputBox.value;

    if (text != null) message = text;

    if (!message) {
      return;
    }

    inputBox.value = '';
    debugger

    //this.isVoice = false
      if(message == "195" && this.isStarted == false){
        this.messages.push({ from: 'You', text: message });
        this.messages.push({ from: "GoRuno", text: `1. Borcunuz haqqında \n 2. Əlavə suallar ` })
        
        // Send message to server
        //this.isVoice = true
        this.textToSpeech("Salam 195 çağrı mərkəzinə xoş gəlmisiniz. Zəhmət olmasa probleminizi qeyd edin. Əgər sorğunuz borcunuz ilə bağlıdırsa 1 düyməsini, əlavə suallarınız varsa 2 düyməsini seçin. ")
        
        
        // this.currentSpeech
        // Add response to chat window
        //this.messages.push({ from: 'GoRuno', text: response });
        this.isReturned = true;
        this.isStarted = true;
      }
      else if(message == 1 && this.isStarted == true){
        this.textToSpeech("Zəhmət olmasa VÖEN kodunuzu qeyd edin");
        inputBox.value = '';
      } 
      else if(message.length == 8 && this.isStarted == true){
        inputBox.value = '';
        const response = await this.http.get(`{Azure API URL}=${message}`).toPromise();
        let array = []
        array.push(response)
        array.forEach(element => {
          let str = `Salam hörmətli ${element["firstName"]} ${element["lastName"]}. Sizin borcunuz ${element["borc"]} Manat məbləğindədir.`
          this.textToSpeech(str)
          
        this.messages.push({ from: 'You', text: message });
        this.messages.push({ from: "GoRuno", text: str })
        });
        this.isStarted = false
        //console.log(response)
      }
      else if(message == 2 && this.isStarted == true){

      await this.textToSpeech("Zəhmət olmasa sualınızı qeyd edin.")
      inputBox.value = '';

    }
    else if (message.length > 8) {
      // Add message to chat window
      this.messages.push({ from: 'You', text: message });

      // Send message to server
      const response = await this.http.get(`{Azure API URL}=${message}`, { responseType: "text" }).toPromise();

      // Add response to chat window
      this.messages.push({ from: 'GoRuno', text: response });
      this.isReturned = true;

      this.textToSpeech(response);
      // Clear input box

      // Scroll to bottom of chat window
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    }

  }

  isClicked: boolean = false;
  public speechToText() {
    this.speechConfig.speechRecognitionLanguage = "az-AZ";
    this.speechRecognizer = new SpeechRecognizer(this.speechConfig);
    this.isClicked = true;

    return new Promise((resolve, reject) => {
      this.speechRecognizer.recognizeOnceAsync(result => {
        let text = "";
        switch (result.reason) {
          case ResultReason.RecognizedSpeech:
            text = result.text;
            break;
          case ResultReason.NoMatch:
            text = "Speech could not be recognized.";
            reject(text);
            break;
          case ResultReason.Canceled:
            var cancellation = CancellationDetails.fromResult(result);
            text = "Cancelled: Reason= " + cancellation.reason;
            if (cancellation.reason == CancellationReason.Error) {
              text = "Canceled: " + cancellation.ErrorCode;
            }
            reject(text);
            break;
        }
        resolve(text);
        this.sendMessage(null, text);
        this.isClicked = false;
      });
    });

  }


  public textToSpeech(text: string) {
    this.speechConfig.speechSynthesisVoiceName = "az-AZ-BabekNeural";
    this.speechConfig.speechSynthesisLanguage = "az-AZ";
    this.speechSynthesizer = new SpeechSynthesizer(this.speechConfig);
    const synthesisResult = this.speechSynthesizer.speakTextAsync(text);
  }

  createAndDownloadAudioFile(): void {
    const synth = window.speechSynthesis;
    const audio = new Audio();
    const url = 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav';
    audio.src = url;

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = 'This is a test utterance';
    utterance.voice = synth.getVoices()[0];
    utterance.onend = () => {
      audio.play();
      const a = document.createElement('a');
      a.download = 'audio.wav';
      a.href = url;
      a.click();
    };
    synth.speak(utterance);
  }

  downloadAudio(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);

    const blob = new Blob([utterance.audioBlob], { type: 'audio/webm' }); // Create a blob from the audio data
    saveAs(blob, "output.mp3");
    const url = URL.createObjectURL(blob); // Create a URL from the blob
    const link = document.createElement('a'); // Create a link element
    link.href = url;
    link.download = 'speech.webm'; // Set the filename
    link.click(); // Click the link to start the download

  }


  async synthesizeSpeech() {
    const subscriptionKey = 'SubsKey';
    const serviceRegion = 'eastus';
    const voiceName = 'az-AZ-BabekNeural';
    const text = 'Hello, world! My name is Babek.';

    const headers = new HttpHeaders({
      'Content-Type': 'application/ssml+xml',
      'Ocp-Apim-Subscription-Key': subscriptionKey
    });
    const body = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
      <voice name='${voiceName}'>${text}</voice>
    </speak>`;
    const url = `https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;
    const response = await this.http.post(url, body, { headers, responseType: 'blob' }).toPromise();
    console.log(response);
    // const blob = new Blob([response], { type: 'audio/mpeg' }); // Create a blob from the audio data
    // saveAs(blob, "output.mp3");


    const audio = new Audio('../../assets/result.mp3');
    audio.src = URL.createObjectURL(response);

    audio.play();
    console.log(audio.src);
  }

  public getAudio(text: string): Observable<Blob> {
    const apiUrl = 'apiUrl';
    const apiKey = 'ApiKEY';
    const headers = {
      'Content-Type': 'application/ssml+xml',
      'Ocp-Apim-Subscription-Key': apiKey,
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
    };
    const body = `<?xml version="1.0"?>
      <speak version="1.0" xml:lang="en-US">
        <voice xml:lang="en-US" xml:gender="Female" name="en-US-AriaNeural">
          ${text}
        </voice>
      </speak>`;
    const responseType = 'blob';
    return this.http.post(apiUrl, body, { headers, responseType }).pipe(
      map(response => response as Blob)
    );
  }

  public speak(): void {
    const text = 'Hello, world!';
    this.getAudio(text).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      console.log(blob)
      console.log(audio.src);
    });
  }

  onFileSelected(event) {
    this.inputFile = event.target.files[0];
  }

  async convertToMp3() {
    const inputAudioBuffer = await this.decodeAudioFile(this.inputFile);
    const outputAudioBuffer = await this.encodeAudioBuffer(inputAudioBuffer, 'audio/mpeg');

    this.outputFile = new File([outputAudioBuffer], 'output.mp3', { type: 'audio/mpeg' });
  }

  async decodeAudioFile(file: File): Promise<AudioBuffer> {
    const audioContext = new AudioContext();
    const audioData = await file.arrayBuffer();
    return await audioContext.decodeAudioData(audioData);
  }

  async encodeAudioBuffer(audioBuffer: AudioBuffer, mimeType: string): Promise<Blob> {
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const encoder = new MediaRecorder(destination.stream, { mimeType });
    const audioBufferSource = audioContext.createBufferSource();
    audioBufferSource.buffer = audioBuffer;
    audioBufferSource.connect(destination);
    audioBufferSource.start();

    return new Promise<Blob>((resolve, reject) => {
      const chunks = [];
      encoder.ondataavailable = (event) => chunks.push(event.data);
      encoder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      encoder.onerror = (error) => reject(error);
      encoder.start();
      setTimeout(() => encoder.stop(), audioBuffer.duration * 1000);
    });
  }

  onOutputFileSelected(event) {
    this.outputFile = event.target.files[0];
  }

};

  // async getResponse(message: string) {
  //   const promiseData = this.http.get<string>({
  //     controller: "chat",
  //     queryString: `request=${message}`
  //   }).toPromise();

  //   return await promiseData;
  // }

