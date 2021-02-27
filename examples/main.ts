// eslint-disable-next-line
import * as Turbo from '@hotwired/turbo';

import Vivere from '../dist/vivere.es2017-esm';

import Accordion from './includes/examples/tabs/accordion';
import AccordionSection from './includes/examples/tabs/section';

import FancyCounter from './includes/examples/counters/fancy';

import ToDoItem from './includes/examples/to-do-list/item';
import ToDoList from './includes/examples/to-do-list/list';
import ToDoNewItem from './includes/examples/to-do-list/new-item';
import ToDoSearch from './includes/examples/to-do-list/search';

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);
Vivere.register('FancyCounter', FancyCounter);
Vivere.register('ToDoItem', ToDoItem);
Vivere.register('ToDoList', ToDoList);
Vivere.register('ToDoNewItem', ToDoNewItem);
Vivere.register('ToDoSearch', ToDoSearch);
