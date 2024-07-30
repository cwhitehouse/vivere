import DisplayDirective from '../directives/display/display';
import { RenderController } from './render-controller';

export default class ToggableRenderController implements RenderController {
  $shouldRender = false;
  $dirty = false;

  renderController?: RenderController;

  awaitingRender: Set<DisplayDirective> = new Set();

  constructor(shouldRender: boolean, renderController: RenderController) {
    this.renderController = renderController;
    this.$shouldRender = shouldRender;
  }

  setShouldRender(shouldRender: boolean): void {
    this.$shouldRender = shouldRender;
    if (this.$shouldRender)
      this.awaitingRender.forEach((d) => {
        d.component?.$queueRender(d);
        this.awaitingRender.delete(d);
      });
  }

  shouldRender(): boolean {
    return this.$shouldRender;
  }
}
