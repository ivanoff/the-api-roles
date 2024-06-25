# the-api roles


### Installation

```bash
npm i -S the-api-roles
```

### Usage

`cat index.ts`

```typescript
import { roles } from 'the-api-roles';

roles.init({
  root: ['*'],
  admin: ['_.registered', 'testNews.*'],
  manager: ['_.registered', 'testNews.delete'],
  registered: ['testNews.get'],
});

const router = new Routings();

router.crud({
  table: 'testNews',
  permissions: { protectedMethods: ['*'] },
});

const theAPI = new TheAPI({ roles, routings: [router] });

export default theAPI.up();
```

`bun index.ts`
