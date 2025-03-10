
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';

const IndexPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Long-Term Car Rental Made Easy
        </h1>
        <p className="text-xl text-muted-foreground max-w-prose mb-10">
          Rent third-party-owned cars for short-term (2 weeks+) or long-term (3 months+) periods.
          No hassle, transparent pricing, and maintenance included.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button asChild size="lg">
            <Link to="/cars">Browse Available Cars</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">Sign In / Register</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default IndexPage;
