import * as decoders from "decoders";

const employeeDecoder = decoders.object({
    names: decoders.object({
        firstName: decoders.string,
        lastName: decoders.string
    }),
    age: decoders.optional(decoders.number),
    url: decoders.string,
    frog: decoders.constant("a"),
    cat: decoders.constant(83)
});

const payrollDecoder = decoders.object({
    employee: employeeDecoder,
    salary: decoders.number,
    frog: decoders.either(decoders.number, decoders.string, decoders.boolean, decoders.jsonObject)
});