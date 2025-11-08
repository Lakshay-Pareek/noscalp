"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const blogs = [
  {
    id: 1,
    title: "6 Strategies to Find Your Conference Keynote and Other Speakers",
    description:
      "Sekarang, kamu bisa produksi tiket fisik untuk eventmu bersama Bostiketbos. Hanya perlu mengikuti beberapa langkah mudah...",
    author: "Danil Anita",
    date: "12 min",
    image: "/Blogs/1.png",
  },
  {
    id: 2,
    title:
      "How Successfully Used Paid Marketing to Drive Incremental Ticket Sales",
    description:
      "Sekarang, kamu bisa produksi tiket fisik untuk eventmu bersama Bostiketbos. Hanya perlu mengikuti beberapa langkah mudah...",
    author: "Danil Anita",
    date: "12 min",
    image: "/Blogs/2.png",
  },
  {
    id: 3,
    title: "Introducing Workspaces: Work smarter, not harder with new features",
    description:
      "Sekarang, kamu bisa produksi tiket fisik untuk eventmu bersama Bostiketbos. Hanya perlu mengikuti beberapa langkah mudah...",
    author: "Danil Anita",
    date: "12 min",
    image: "/Blogs/3.png",
  },
];

export default function Blog() {
  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center lg:mb-12"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Blog
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, idx) => (
            <motion.article
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-linear-to-br from-gray-200 to-gray-300">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-gray-900">
                  {blog.title}
                </h3>
                <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                  {blog.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{blog.author}</span>
                  <span>{blog.date}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full border-2 border-purple-600 bg-transparent px-10 py-3 text-sm font-medium text-purple-600 transition-all hover:bg-purple-50"
          >
            Load More
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
