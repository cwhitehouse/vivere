import Turbolinks from 'turbolinks';
import Vivere from '../package/js/vivere';

import Accordion from './components/accordion/accordion.js';
import AccordionSection from './components/accordion/section.js';
import Counter from './components/counter.js';
import ToDoItem from './components/to-do/item.js';
import ToDoList from './components/to-do/list.js';
import ToDoNewItem from './components/to-do/new-item.js';
import ToDoSearch from './components/to-do/search.js';
import TurboRefresh from './components/turbo-refresh/script.js';

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);
Vivere.register('Counter', Counter);
Vivere.register('ToDoItem', ToDoItem);
Vivere.register('ToDoList', ToDoList);
Vivere.register('ToDoNewItem', ToDoNewItem);
Vivere.register('ToDoSearch', ToDoSearch);
Vivere.register('TurboRefresh', TurboRefresh);

Vivere.setup();
Turbolinks.start();
