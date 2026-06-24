// Angular wrapper for openpostcards-builder.
// The editor is React-based; we mount it via the framework-neutral factory.
//
// Add the stylesheet to angular.json "styles":
//   "node_modules/openpostcards-builder/dist/styles.css"
//
// react and react-dom are peer dependencies — install them in your Angular app:
//   npm install react react-dom openpostcards-builder
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { createEmailBuilder } from "openpostcards-builder";

@Component({
  selector: "email-builder",
  standalone: true,
  template: `<div #host style="height:100vh"></div>`,
})
export class EmailBuilderComponent implements OnInit, OnDestroy {
  @Input() initialDocument: unknown = undefined;
  @Output() docChange = new EventEmitter<unknown>();
  @Output() exportHtml = new EventEmitter<string>();

  @ViewChild("host", { static: true }) host!: ElementRef<HTMLElement>;
  private instance: ReturnType<typeof createEmailBuilder> | null = null;

  ngOnInit(): void {
    this.instance = createEmailBuilder({
      container: this.host.nativeElement,
      initialDocument: this.initialDocument as any,
      onChange: (doc) => this.docChange.emit(doc),
      onExportHtml: (html) => this.exportHtml.emit(html),
    });
  }

  ngOnDestroy(): void {
    this.instance?.destroy();
  }
}

// Usage: <email-builder (docChange)="onChange($event)"></email-builder>
