import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css'],
})
export class VideoPlayerComponent implements AfterViewInit {
  @ViewChild('videoPlayer', { static: false }) videoElementRef!: ElementRef;
  @Input() videoUrl!: string;
  @Input() thumbnailUrl?: string;

  private player: any;

  ngAfterViewInit(): void {
    this.initializePlayer();
  }

  initializePlayer(): void {
    const options = {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      aspectRatio: '16:9',
      poster: this.thumbnailUrl,
      sources: [
        {
          src: this.videoUrl,
          type: 'video/mp4',
        },
      ],
    };

    this.player = videojs(this.videoElementRef.nativeElement, options);

    // Track progress
    this.player.on('timeupdate', () => {
      const currentTime = this.player.currentTime();
      const duration = this.player.duration();
      const progress = (currentTime / duration) * 100;

      // Emit progress event to update backend
      console.log('Video progress:', progress);
    });

    this.player.on('ended', () => {
      console.log('Video completed');
      // Mark lesson as completed
    });
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}
