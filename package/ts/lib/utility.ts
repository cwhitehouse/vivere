export default {
  camelCase(name: string): string {
    return name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  pascalCase(name: string): string {
    const camel = this.camelCase(name);
    return `${camel[0].toUpperCase()}${camel.slice(1)}`;
  },

  orderBy<T>(array: T[], keys: string[], directions: ('asc' | 'desc')[]): T[] {
    return [...array].sort((a, b) => {
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const aVal = a[key];
        const bVal = b[key];

        const direction = directions[i];
        const ascending = direction === 'asc';

        if (aVal > bVal) return ascending ? 1 : -1;
        if (bVal > aVal) return ascending ? -1 : 1;
      }

      return 0;
    });
  },
};