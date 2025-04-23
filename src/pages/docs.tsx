// src/pages/docs.tsx
import { GetStaticProps } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic<{
  spec: Record<string, any>;
}>(import('swagger-ui-react'), { ssr: false });

function ApiDocs({ spec }: { spec: Record<string, any> }) {
  return <SwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Healthcare Newsletter Platform API',
        version: '1.0.0',
        description: 'API documentation for the Healthcare Newsletter Platform',
      },
    },
  });

  return {
    props: {
      spec,
    },
  };
};

export default ApiDocs;
