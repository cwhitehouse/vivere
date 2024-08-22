import DisplayDirective from '../directives/display/display';

interface RenderController {
  $dirty: boolean;

  renderController?: RenderController;

  awaitingRender: Set<DisplayDirective>;

  shouldRender(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isRenderController = (arg: any): arg is RenderController =>
  'shouldRender' in arg;

export { RenderController, isRenderController };
