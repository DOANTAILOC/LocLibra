<template>
  <div>
    <section class="relative min-h-[650px] overflow-hidden py-20">
      <div class="absolute inset-0 z-0">
        <img
          class="h-full w-full object-cover opacity-30 mix-blend-multiply"
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80"
          alt="Bên trong không gian thư viện gỗ ấm cúng"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-[rgb(254_253_241/95%)] to-transparent"
        ></div>
      </div>

      <div class="container relative z-10 mx-auto px-4">
        <div class="max-w-2xl">
          <span
            class="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-primary uppercase"
          >
            Tri thức là nguồn cội
          </span>

          <h1
            class="mb-6 text-5xl leading-tight font-bold text-slate-900 md:text-6xl"
          >
            Tìm cuốn sách <br /><span class="text-primary italic"
              >yêu thích</span
            >
            của bạn
          </h1>

          <p
            class="mb-10 max-w-xl text-lg leading-relaxed text-[var(--text-muted)]"
          >
            Khám phá hàng ngàn đầu sách từ văn học cổ điển đến kiến thức hiện
            đại trong không gian cộng đồng thư thái và chuyên nghiệp.
          </p>

          <div
            class="flex flex-col gap-2 rounded-2xl border border-primary/5 bg-white p-2.5 shadow-xl md:flex-row"
          >
            <div
              class="flex flex-1 items-center border-b border-slate-100 px-4 py-3 md:border-r md:border-b-0"
            >
              <span class="material-icons mr-3 text-primary/40">search</span>
              <input
                class="w-full border-none bg-transparent p-0 text-slate-800 outline-none"
                type="text"
                placeholder="Tên sách, tác giả..."
              />
            </div>

            <div class="flex flex-1 items-center px-4 py-3">
              <span class="material-icons mr-3 text-primary/40">menu</span>
              <select
                class="w-full border-none bg-transparent p-0 text-slate-800 outline-none"
              >
                <option>Tất cả thể loại</option>
                <option>Văn học</option>
                <option>Kinh tế</option>
                <option>Thiếu nhi</option>
              </select>
            </div>

            <button
              type="button"
              class="btn-primary rounded-xl px-10 py-3.5 text-sm"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-4 pb-20">
      <div class="mb-8 flex items-end gap-4">
        <h2 class="text-3xl font-light text-[var(--on-surface)]">
          Thành phần hệ thống
        </h2>
        <div class="h-px flex-1 bg-[rgb(184_188_163/35%)]"></div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article class="panel-surface editorial-shadow p-6">
          <p
            class="mb-4 text-xs font-bold tracking-[0.14em] text-[var(--primary)] uppercase"
          >
            Status
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="status-chip status-chip-active">Hoạt động</span>
            <span class="status-chip status-chip-overdue">Quá hạn</span>
            <span class="status-chip status-chip-returned">Đã trả</span>
            <span class="status-chip status-chip-draft">Nháp</span>
          </div>
        </article>

        <article class="panel-surface editorial-shadow p-6">
          <p
            class="mb-4 text-xs font-bold tracking-[0.14em] text-[var(--primary)] uppercase"
          >
            Buttons
          </p>
          <div class="space-y-3">
            <button type="button" class="btn-primary w-full py-3 text-xs">
              Hành động chính
            </button>
            <button type="button" class="btn-secondary w-full py-3 text-sm">
              Hành động phụ
            </button>
            <button type="button" class="btn-ghost w-full py-3 text-sm">
              Hành động bổ trợ
            </button>
          </div>
        </article>

        <article class="panel-surface editorial-shadow p-6">
          <p
            class="mb-4 text-xs font-bold tracking-[0.14em] text-[var(--primary)] uppercase"
          >
            Form Elements
          </p>
          <div class="space-y-3">
            <div class="space-y-1.5">
              <label class="form-label" for="sampleCode">Mã thư viện</label>
              <input
                id="sampleCode"
                type="text"
                class="form-input"
                placeholder="VD: DG-2026"
              />
            </div>
            <div class="space-y-1.5">
              <label class="form-label" for="sampleCategory">Thể loại</label>
              <select id="sampleCategory" class="form-select">
                <option>Tất cả thể loại</option>
                <option>Văn học</option>
                <option>Khoa học</option>
                <option>Kinh tế</option>
              </select>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
