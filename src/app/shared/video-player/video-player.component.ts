import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommunicationService } from '../../services/communication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements AfterViewInit, OnDestroy, OnInit {
  autoplay: boolean = false; // option:: autoplay (start playing video on load)
  controls: boolean = false; // option:: controls (show/hide controls)
  muted: boolean = true; // option:: muted
  loop: boolean = true; // option:: endlessloop
  currentPoster: string = '//vjs.zencdn.net/v/oceans.png'; // option:: poster
  private subscriptions: Subscription = new Subscription();
  player: any;
  fullScreenSubscription: Subscription | undefined;
  currentVideoSource: string = '';
  videoQualities = [
    { label: '360p', src: '//vjs.zencdn.net/v/oceans.mp4' },
    { label: '480p', src: '//vjs.zencdn.net/v/oceans.mp4' },
    { label: '720p', src: '//vjs.zencdn.net/v/oceans.mp4' },
    { label: '1080p', src: '//vjs.zencdn.net/v/oceans.mp4' },
  ];
  playerOptions: any;
  constructor(public communicationService: CommunicationService) {
    this.currentVideoSource = this.videoQualities[1].src;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.communicationService.playVideo$.subscribe((playVideo) => {
        console.log('playVideoSubject', playVideo);
        if (playVideo === true) {
          this.handlePlayVideo();
          this.communicationService.resetPlayVideo();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    const options = {
      controls: this.controls,
      autoplay: this.autoplay,
      muted: this.muted,
      loop: this.loop,
      fluid: true,
      poster: this.currentPoster,
    };

    console.log('playeroptions', options);
    this.player = (window as any).videojs('my-player', options);

    this.player.qualityLevels(this.videoQualities);

    this.player.ready(() => {
      this.player.play();
    });

    this.fullScreenSubscription =
      this.communicationService.isFullScreenVisible$.subscribe((isVisible) => {
        if (isVisible) {
          this.goFullScreen();
        } else {
          this.exitFullScreen();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.fullScreenSubscription) {
      this.fullScreenSubscription.unsubscribe();
    }
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onQualityChange(selectedQuality: string) {
    const currentTime = this.player.currentTime(); // saves current player time
    this.currentVideoSource = selectedQuality; // sets current video source
    this.player.src({ type: 'video/mp4', src: this.currentVideoSource }); // updates video source
    this.player.load(); // reloads video
    this.player.ready(() => {
      this.player.currentTime(currentTime); // sets back to current time
      this.player.play(); // plays video
    });
  }

  handlePlayVideo() {
    console.log('handle play video triggert');
    this.player.play();
    this.player.muted(false);
    this.player.volume(0.5);
    this.player.controls(true);
    this.player.currentTime(0);
    this.goFullScreen();
  }

  goFullScreen(): void {
    if (this.player) {
      this.player.requestFullscreen();
    }
  }

  exitFullScreen(): void {
    if (this.player && this.player.isFullscreen()) {
      this.player.exitFullscreen();
    }
  }
}