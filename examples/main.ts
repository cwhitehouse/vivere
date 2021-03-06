// eslint-disable-next-line import/no-extraneous-dependencies
import '@hotwired/turbo';

import { Vivere } from '../src/vivere';

import Index from './includes/index';
import ExampleGroup from './includes/example-group';
import FilterTag from './includes/filter-tag';

import Accordion from './includes/examples/tabs/accordion';
import AccordionSection from './includes/examples/tabs/section';

import FancyCounter from './includes/examples/counters/fancy';

import ToDoItem from './includes/examples/to-do-list/item';
import ToDoList from './includes/examples/to-do-list/list';
import ToDoNewItem from './includes/examples/to-do-list/new-item';
import ToDoSearch from './includes/examples/to-do-list/search';

import InputSelect from './includes/examples/inputs/select';

Vivere.register('Index', Index);
Vivere.register('ExampleGroup', ExampleGroup);
Vivere.register('FilterTag', FilterTag);

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);

Vivere.register('FancyCounter', FancyCounter);

Vivere.register('ToDoItem', ToDoItem);
Vivere.register('ToDoList', ToDoList);
Vivere.register('ToDoNewItem', ToDoNewItem);
Vivere.register('ToDoSearch', ToDoSearch);

Vivere.register('InputSelect', InputSelect);
