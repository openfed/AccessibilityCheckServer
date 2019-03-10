import { TestBed, inject } from "@angular/core/testing";

import { AppModule } from "../app.module";
import { ApiService } from "./api.service";

describe("ApiService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    });
  });

  it("should be created", inject([ApiService], (service: ApiService) => {
    expect(service).toBeTruthy();
  }));
});
