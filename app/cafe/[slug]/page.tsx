import {notFound} from 'next/navigation'
import { prisma } from '@/lib/prisma';

type CafePageProps = {
    params: Promise<{
        slug:string
    }>;
};

export default async function CafePage({ params }: CafePageProps) {
    const {slug} = await params;

    const cafe = await prisma.cafe.findUnique({
        where:{
            slug,
        },
        include:{
            categories:{
                where:{
                    active:true,
                },
                orderBy:{
                    sortOrder:'asc',
                },
                include:{
                    items:{
                        where:{
                            available:true,
                        },
                        orderBy:{
                            sortOrder:'asc',
                        },
                    },
                },
            },
        },
    });

    if(!cafe || !cafe.active){
        notFound();
    }

    return(
        <main className="min-h-screen bg-[#5a3a29] px-4 py-10 text-white">
            <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#c19d50]">
            Welcome to
          </p>

          <h1 className="text-4xl font-bold text-[#EAC26B]">
            {cafe.name}
          </h1>

          {cafe.description && (
            <p className="mt-3 text-white/70">
              {cafe.description}
            </p>
          )}
        </header>

        <div className="space-y-10">
          {cafe.categories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-4 border-b border-white/20 pb-3 text-2xl font-semibold text-[#EAC26B]">
                {category.name}
              </h2>

              <div className="space-y-4">
                {category.items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-white/15 bg-white/5 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className="mt-1 text-sm text-white/60">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <p className="whitespace-nowrap text-lg font-semibold text-[#EAC26B]">
                        ₹{item.price}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div> 
        </main>
    );
}