import DisplayDirective from '../directives/display/display';

interface RenderController {
  $dirty: boolean;

  renderController?: RenderController;

  awaitingRender: Set<DisplayDirective>;

  shouldRender(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
const isRenderController = (arg: any): arg is RenderController => 'shouldRender' in arg;

export { RenderController, isRenderController };
