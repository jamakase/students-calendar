import React from 'react';

export default function StudentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-gray-100 p-4">
        <h1 className="text-xl font-bold">Students</h1>
      </header>
      <main className="p-8">
        {children}
      </main>
      <footer className="bg-gray-100 p-4 text-center">
        <p>© 2023 Students Calendar</p>
      </footer>
    </>
  );
} 